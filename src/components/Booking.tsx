import { useEffect, useState, useCallback } from 'react';
import {
  Calendar, Clock, Check, ChevronLeft, ChevronRight,
  User, Phone, Mail, Sparkles, Loader2, AlertCircle, PartyPopper
} from 'lucide-react';
import {
  fetchServices, fetchTimeSlots, fetchAppointments, createAppointment,
  services as servicesMock, defaultTimeSlots,
  type Service, type Appointment, type TimeSlot
} from '../lib/supabase';
import {
  formatNaira, formatDuration, formatTime, formatTimeShort,
  addMinutesToTime, timeToMinutes, generateTimeSlots,
  toDateString, isPast, isToday
} from '../lib/utils';

type Props = {
  onNavigate: (page: string) => void;
  preselectedService?: Service | null;
};

type Step = 'service' | 'datetime' | 'details' | 'confirm' | 'success';

export default function Booking({ onNavigate, preselectedService }: Props) {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(preselectedService || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<Appointment[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [paymentOption, setPaymentOption] = useState<'full' | 'half'>('full');

  const amountToPay = selectedService 
    ? (paymentOption === 'full' ? selectedService.price : selectedService.price / 2) 
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, slotsData] = await Promise.all([
          fetchServices().catch((err) => {
            console.warn('Using mock services fallback due to:', err);
            return servicesMock;
          }),
          fetchTimeSlots().catch((err) => {
            console.warn('Using mock timeSlots fallback due to:', err);
            return defaultTimeSlots;
          }),
        ]);
        setServices(servicesData && servicesData.length > 0 ? servicesData : servicesMock);
        setTimeSlots(slotsData && slotsData.length > 0 ? slotsData : defaultTimeSlots);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setServices(servicesMock);
        setTimeSlots(defaultTimeSlots);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setStep('datetime');
    }
  }, [preselectedService]);

  const fetchBookedSlots = useCallback(async (date: Date) => {
    setCheckingAvailability(true);
    const dateStr = toDateString(date);
    try {
      const data = await fetchAppointments(dateStr);
      const booked = data.filter(a => a.status === 'pending' || a.status === 'confirmed');
      setBookedSlots(booked);
    } catch (err) {
      console.error('Failed to fetch booked slots:', err);
    }
    setCheckingAvailability(false);
  }, []);

  useEffect(() => {
    if (selectedDate) fetchBookedSlots(selectedDate);
  }, [selectedDate, fetchBookedSlots]);

  const getWorkingHours = (date: Date): TimeSlot | null => {
    const dayOfWeek = date.getDay();
    return timeSlots.find((s) => s.day_of_week === dayOfWeek && s.is_active) || null;
  };

  const isSlotAvailable = (slotTime: string, service: Service): boolean => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + service.duration_minutes;
    for (const booked of bookedSlots) {
      const bookedStart = timeToMinutes(booked.start_time);
      const bookedEnd = timeToMinutes(booked.end_time);
      if (slotStart < bookedEnd && slotEnd > bookedStart) return false;
    }
    return true;
  };

  const getAvailableSlots = (): string[] => {
    if (!selectedDate || !selectedService) return [];
    const workingHours = getWorkingHours(selectedDate);
    if (!workingHours) return [];
    const allSlots = generateTimeSlots(workingHours.start_time, workingHours.end_time, 30);
    const workingEnd = timeToMinutes(workingHours.end_time);
    return allSlots.filter((slot) => {
      const slotEnd = timeToMinutes(slot) + selectedService.duration_minutes;
      if (slotEnd > workingEnd) return false;
      if (isToday(selectedDate)) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (timeToMinutes(slot) <= currentMinutes + 60) return false;
      }
      return isSlotAvailable(slot, selectedService);
    });
  };

  const handleDateSelect = (date: Date) => {
    if (isPast(date)) return;
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }

    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setSubmitting(true);
    setError('');

    const endTime = addMinutesToTime(selectedTime, selectedService.duration_minutes);
    const appointmentData = {
      client_name: formData.name.trim(),
      client_phone: formData.phone.trim(),
      client_email: formData.email.trim() || null,
      service_id: selectedService.id,
      service_name: selectedService.name,
      service_price: selectedService.price,
      service_duration: selectedService.duration_minutes,
      appointment_date: toDateString(selectedDate),
      start_time: selectedTime,
      end_time: endTime,
      status: 'pending' as const,
      notes: (formData.notes.trim() ? formData.notes.trim() + '\n' : '') + `Payment Method: Manual Transfer (${paymentOption === 'full' ? 'Full' : 'Half'} Payment)`,
    };

    try {
      const data = await createAppointment(appointmentData);
      setConfirmedAppointment(data);
      setStep('success');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('conflict') || msg.toLowerCase().includes('already booked')) {
        setError('That time slot was just booked by someone else! Please select another time.');
      } else {
        setError(msg || 'Unable to book your appointment. Please try again or contact us directly.');
      }
    }
    setSubmitting(false);
  };

  const resetBooking = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime('');
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setConfirmedAppointment(null);
    setError('');
  };

  if (loading) {
    return (
      <section className="pt-32 pb-24 min-h-screen section-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#b38b9e' }} />
      </section>
    );
  }

  if (step === 'success' && confirmedAppointment) {
    return (
      <section className="pt-32 pb-24 min-h-screen section-light flex items-center">
        <div className="container-lux max-w-2xl">
          <div className="card-lux p-10 md:p-14 text-center animate-scale-in"
            style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(179, 139, 158, 0.2)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(179, 139, 158, 0.08)', border: '1px solid rgba(179, 139, 158, 0.3)' }}>
              <PartyPopper className="w-10 h-10" style={{ color: '#b38b9e' }} />
            </div>
            <h2 className="heading-serif text-4xl mb-4" style={{ color: '#3d2e36' }}>
              Appointment Requested!
            </h2>
            <p className="leading-relaxed mb-8" style={{ color: '#b38b9e' }}>
              Thank you so much, {confirmedAppointment.client_name}! I have received your booking request.
              I will personally confirm your appointment with you via WhatsApp or phone shortly. I can't wait to see you!
            </p>

            <div className="rounded-2xl p-6 text-left space-y-3 mb-8"
              style={{ background: 'rgba(203,164,149,0.6)', border: '1px solid rgba(179, 139, 158, 0.08)' }}>
              {[
                { l: 'Service', v: confirmedAppointment.service_name },
                { l: 'Date', v: new Date(confirmedAppointment.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
                { l: 'Time', v: `${formatTime(confirmedAppointment.start_time)} – ${formatTime(confirmedAppointment.end_time)}` },
              ].map((row) => (
                <div key={row.l} className="flex justify-between items-center pb-3"
                  style={{ borderBottom: '1px solid rgba(179, 139, 158, 0.08)' }}>
                  <span className="text-sm" style={{ color: '#5a4850' }}>{row.l}</span>
                  <span className="font-medium text-sm" style={{ color: '#3d2e36' }}>{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm" style={{ color: '#5a4850' }}>Price</span>
                <span className="font-serif text-2xl" style={{ color: '#b38b9e' }}>
                  {formatNaira(confirmedAppointment.service_price)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Plot+2079+Nonso+Benson+Udeh+Street+Abuja+Nigeria" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-gold text-sm text-center flex-1"
              >
                Get Directions to Studio
              </a>
              <button onClick={() => onNavigate('home')} className="btn-outline text-sm flex-1">
                Back to Home
              </button>
            </div>
            <div className="mt-4 text-center">
              <button onClick={resetBooking} className="btn-ghost text-xs">
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'service', label: 'Service' },
    { key: 'datetime', label: 'Date & Time' },
    { key: 'details', label: 'Details' },
    { key: 'confirm', label: 'Confirm' },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <section className="pt-32 pb-24 min-h-screen section-light">
      <div className="container-lux max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-label">
            <span className="w-8 h-px" style={{ background: 'rgba(179, 139, 158, 0.5)' }} />
            Book Your Visit
            <span className="w-8 h-px" style={{ background: 'rgba(179, 139, 158, 0.5)' }} />
          </span>
          <h1 className="heading-serif text-4xl md:text-5xl mt-4" style={{ color: '#3d2e36' }}>
            Reserve Your <span className="italic" style={{ color: '#b38b9e' }}>Moment</span>
          </h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex flex-col items-center gap-2 ${idx <= currentStepIndex ? '' : 'opacity-30'}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300"
                  style={{
                    background: idx < currentStepIndex ? '#b38b9e'
                      : idx === currentStepIndex ? 'rgba(179, 139, 158, 0.3)'
                      : 'rgba(255,255,255,0.5)',
                    color: idx < currentStepIndex ? '#d5b1a3'
                      : idx === currentStepIndex ? '#b38b9e'
                      : '#5a4850',
                    border: idx === currentStepIndex ? '2px solid rgba(74,35,17,0.6)' : '1px solid rgba(179, 139, 158, 0.3)',
                    boxShadow: idx === currentStepIndex ? '0 0 20px rgba(179, 139, 158, 0.2)' : 'none',
                  }}>
                  {idx < currentStepIndex ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <span className="text-[10px] sm:text-xs font-medium" style={{ color: idx === currentStepIndex ? '#b38b9e' : '#8f7882' }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="w-8 sm:w-12 md:w-20 h-px mx-2 transition-colors"
                  style={{ background: idx < currentStepIndex ? '#b38b9e' : 'rgba(179, 139, 158, 0.08)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step: Service */}
        {step === 'service' && (
          <div className="grid md:grid-cols-2 gap-4 animate-fade-up">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep('datetime');
                }}
                className="card-lux p-6 text-left hover:shadow-xl group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-serif text-xl transition-colors" style={{ color: '#3d2e36' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#b38b9e')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#3d2e36')}>
                    {service.name}
                  </h3>
                  <span className="font-serif text-xl shrink-0 ml-3" style={{ color: '#b38b9e' }}>
                    {formatNaira(service.price)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#b38b9e' }}>
                  {service.description}
                </p>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: '#5a4850' }}>
                  <Clock className="w-4 h-4" style={{ color: '#3d2e36' }} />
                  {formatDuration(service.duration_minutes)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step: Date & Time */}
        {step === 'datetime' && selectedService && (
          <div className="card-lux p-8 md:p-10 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl" style={{ color: '#3d2e36' }}>{selectedService.name}</h3>
                <p className="text-sm" style={{ color: '#5a4850' }}>
                  {formatNaira(selectedService.price)} · {formatDuration(selectedService.duration_minutes)}
                </p>
              </div>
              <button onClick={() => setStep('service')} className="btn-ghost text-sm">
                <ChevronLeft className="w-4 h-4" /> Change
              </button>
            </div>

            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#b38b9e' }}>
              Select a Date
            </h4>
            <DatePicker
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              getWorkingHours={getWorkingHours}
            />

            {selectedDate && (
              <>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 mt-8" style={{ color: '#b38b9e' }}>
                  Available Times
                  {checkingAvailability && (
                    <Loader2 className="w-4 h-4 inline ml-2 animate-spin" style={{ color: '#b38b9e' }} />
                  )}
                </h4>
                {getAvailableSlots().length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {getAvailableSlots().map((slot) => (
                      <button
                        key={slot}
                        onClick={() => {
                          setSelectedTime(slot);
                          setStep('details');
                        }}
                        className="py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          background: selectedTime === slot ? '#b38b9e' : 'rgba(255,255,255,0.4)',
                          color: selectedTime === slot ? '#d5b1a3' : '#b38b9e',
                          border: `1px solid ${selectedTime === slot ? '#b38b9e' : 'rgba(179, 139, 158, 0.08)'}`,
                        }}
                      >
                        {formatTimeShort(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl p-6 text-center"
                    style={{ background: 'rgba(200,60,60,0.06)', border: '1px solid rgba(200,60,60,0.15)' }}>
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(200,80,80,0.7)' }} />
                    <p className="text-sm" style={{ color: 'rgba(200,100,100,0.8)' }}>
                      No available slots for this day. Please select another date.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && selectedService && selectedDate && selectedTime && (
          <div className="card-lux p-8 md:p-10 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl" style={{ color: '#3d2e36' }}>Your Details</h3>
              <button onClick={() => setStep('datetime')} className="btn-ghost text-sm">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="rounded-xl p-4 mb-6 flex items-center gap-3"
              style={{ background: 'rgba(74,35,17,0.06)', border: '1px solid rgba(179, 139, 158, 0.3)' }}>
              <Calendar className="w-5 h-5 shrink-0" style={{ color: '#b38b9e' }} />
              <div className="text-sm" style={{ color: '#5a4850' }}>
                <span className="font-medium" style={{ color: '#3d2e36' }}>{selectedService.name}</span>
                {' · '}
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' at '}
                {formatTime(selectedTime)}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label-lux">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#5a4850' }} />
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-lux pl-10" placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label className="label-lux">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#5a4850' }} />
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-lux pl-10" placeholder="e.g. 0801 234 5678" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label-lux">Email (optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#5a4850' }} />
                  <input type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-lux pl-10" placeholder="you@email.com" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label-lux">Notes (optional)</label>
                <textarea value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-lux resize-none" rows={3}
                  placeholder="Any special requests, allergies, or preferences..." />
              </div>
            </div>

            <button
              onClick={() => {
                if (!formData.name.trim() || !formData.phone.trim()) {
                  setError('Please provide your name and phone number.');
                  return;
                }
                setError('');
                setStep('confirm');
              }}
              className="btn-gold w-full mt-6 py-4"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
            {error && (
              <p className="text-sm mt-3 text-center flex items-center justify-center gap-1.5"
                style={{ color: 'rgba(200,80,80,0.8)' }}>
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedService && selectedDate && selectedTime && (
          <div className="card-lux p-8 md:p-10 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl" style={{ color: '#3d2e36' }}>Confirm Your Booking</h3>
              <button onClick={() => setStep('details')} className="btn-ghost text-sm">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="space-y-1 mb-8">
              {[
                { l: 'Service', v: selectedService.name },
                { l: 'Date', v: selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                { l: 'Time', v: `${formatTime(selectedTime)} – ${formatTime(addMinutesToTime(selectedTime, selectedService.duration_minutes))}` },
                { l: 'Name', v: formData.name },
                { l: 'Phone', v: formData.phone },
                ...(formData.email ? [{ l: 'Email', v: formData.email }] : []),
              ].map((row) => (
                <div key={row.l} className="flex justify-between items-center py-3"
                  style={{ borderBottom: '1px solid rgba(179, 139, 158, 0.08)' }}>
                  <span className="text-sm" style={{ color: '#5a4850' }}>{row.l}</span>
                  <span className="font-medium text-sm" style={{ color: '#3d2e36' }}>{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm" style={{ color: '#5a4850' }}>Total</span>
                <span className="font-serif text-2xl" style={{ color: '#b38b9e' }}>
                  {formatNaira(selectedService.price)}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-5 mb-6 space-y-4"
              style={{ background: 'rgba(179, 139, 158, 0.04)', border: '1px solid rgba(74,35,17,0.12)' }}>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#b38b9e' }} />
                <p className="text-sm font-medium" style={{ color: '#b38b9e' }}>
                  Choose your payment option to secure your spot
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${paymentOption === 'full' ? 'border-[#b38b9e] bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_option" 
                      value="full" 
                      checked={paymentOption === 'full'}
                      onChange={() => setPaymentOption('full')}
                      className="w-4 h-4 accent-[#b38b9e]"
                    />
                    <span className="text-sm font-medium" style={{ color: '#3d2e36' }}>Pay Full Amount</span>
                  </div>
                  <span className="font-serif text-lg" style={{ color: '#b38b9e' }}>{formatNaira(selectedService.price)}</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${paymentOption === 'half' ? 'border-[#b38b9e] bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_option" 
                      value="half" 
                      checked={paymentOption === 'half'}
                      onChange={() => setPaymentOption('half')}
                      className="w-4 h-4 accent-[#b38b9e]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium" style={{ color: '#3d2e36' }}>Pay 50% Deposit</span>
                      <span className="text-xs" style={{ color: '#b38b9e' }}>Balance due at studio</span>
                    </div>
                  </div>
                  <span className="font-serif text-lg" style={{ color: '#b38b9e' }}>{formatNaira(selectedService.price / 2)}</span>
                </label>
              </div>
            </div>

            <div className="rounded-xl p-5 mb-6 text-center space-y-3"
              style={{ background: '#fdfbf9', border: '1px dashed #b38b9e' }}>
              <p className="text-sm font-medium" style={{ color: '#b38b9e' }}>Please transfer exactly <span className="font-serif font-bold text-lg">{formatNaira(amountToPay)}</span> to:</p>
              
              <div className="bg-white rounded-lg p-4 inline-block text-left shadow-sm">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#5a4850' }}>Bank Name</p>
                <p className="font-bold text-lg mb-3" style={{ color: '#3d2e36' }}>OPay</p>
                
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#5a4850' }}>Account Number</p>
                <p className="font-bold text-2xl tracking-widest mb-3" style={{ color: '#b38b9e' }}>8087026970</p>
                
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#5a4850' }}>Account Name</p>
                <p className="font-bold text-lg" style={{ color: '#3d2e36' }}>Samaila Florence</p>
              </div>
              <p className="text-xs" style={{ color: '#b38b9e' }}>I will verify your transfer and confirm your booking via WhatsApp.</p>
            </div>

            {error && (
              <p className="text-sm mb-4 text-center flex items-center justify-center gap-1.5" style={{ color: 'rgba(200,80,80,0.8)' }}>
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={submitting} className="btn-gold w-full disabled:opacity-60 py-4 flex items-center justify-center gap-2">
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Booking...</>
              ) : (
                <><Check className="w-5 h-5" /> I Have Made The Transfer</>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function DatePicker({
  selectedDate,
  onSelect,
  getWorkingHours,
}: {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  getWorkingHours: (date: Date) => TimeSlot | null;
}) {
  const [viewMonth, setViewMonth] = useState(new Date());

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="rounded-2xl p-3 sm:p-5" style={{ background: '#fdfbf9', border: '1px solid rgba(179, 139, 158, 0.3)' }}>
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(179, 139, 158, 0.04)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(74,35,17,0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(179, 139, 158, 0.04)')}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: '#b38b9e' }} />
        </button>
        <h4 className="font-serif text-lg font-medium" style={{ color: '#3d2e36' }}>
          {monthNames[month]} {year}
        </h4>
        <button
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(179, 139, 158, 0.04)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(74,35,17,0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(179, 139, 158, 0.04)')}
        >
          <ChevronRight className="w-5 h-5" style={{ color: '#b38b9e' }} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold py-2" style={{ color: '#b38b9e' }}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const isPastDay = date < today;
          const hasHours = getWorkingHours(date) !== null;
          const isDisabled = isPastDay || !hasHours;
          const isSelected = selectedDate && toDateString(date) === toDateString(selectedDate);

          return (
            <button
              key={idx}
              disabled={isDisabled}
              onClick={() => onSelect(date)}
              className="aspect-square min-h-[40px] rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: isSelected ? '#b38b9e' : 'transparent',
                color: isSelected ? '#fdfbf9'
                  : isDisabled ? 'rgba(74,35,17,0.22)'
                  : '#b38b9e',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!isDisabled && !isSelected) e.currentTarget.style.background = 'rgba(179, 139, 158, 0.08)'; }}
              onMouseLeave={(e) => { if (!isDisabled && !isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
