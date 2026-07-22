"use client";
import { useEffect, useState, useCallback } from 'react';
import {
  Calendar, Clock, Check, ChevronLeft, ChevronRight,
  User, Phone, Mail, Sparkles, Loader2, AlertCircle, PartyPopper
} from 'lucide-react';
import {
  fetchServices, fetchTimeSlots, fetchAppointments, createAppointment,
  services as servicesMock, defaultTimeSlots,
  type Service, type Appointment, type TimeSlot
} from '../lib/api';
import {
  formatNaira, formatDuration, formatTime, formatTimeShort,
  addMinutesToTime, timeToMinutes, generateTimeSlots,
  toDateString, isPast, isToday
} from '../lib/utils';

import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  preselectedService?: Service | null;
};

type Step = 'service' | 'datetime' | 'details' | 'confirm' | 'success';

export default function Booking({ preselectedService }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [groupSize, setGroupSize] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalPrice = selectedService ? selectedService.price * groupSize : 0;
  const totalDuration = selectedService ? selectedService.duration_minutes * groupSize : 0;

  const amountToPay = paymentOption === 'full' ? totalPrice : totalPrice / 2;

  const CATEGORIES = [
    {
      id: 'lash',
      title: 'Lash Services',
      description: 'Luxurious lash extensions tailored to your eye shape.',
      image: '/images/category-lash-v2.jpg',
    },
    {
      id: 'brows',
      title: 'Brow Services',
      description: 'Expert brow shaping, tinting, and microblading.',
      image: '/images/category-brow.jpg',
    },
    {
      id: 'lash-refill',
      title: 'Lash Refill',
      description: 'Maintain your gorgeous lashes with regular refills.',
      image: '/images/category-lash-refill.jpg',
    }
  ];

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

  // Auto-select from URL param ?service=id
  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setStep('datetime');
      return;
    }
    const serviceId = searchParams?.get('service');
    if (serviceId && services.length > 0) {
      const found = services.find(s => s.id === serviceId);
      if (found) {
        setSelectedService(found);
        setStep('datetime');
      }
    }
  }, [preselectedService, searchParams, services]);

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

  const isSlotAvailable = (slotTime: string): boolean => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + totalDuration;
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
      const slotEnd = timeToMinutes(slot) + totalDuration;
      if (slotEnd > workingEnd) return false;
      if (isToday(selectedDate)) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (timeToMinutes(slot) <= currentMinutes + 60) return false;
      }
      return isSlotAvailable(slot);
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

    const endTime = addMinutesToTime(selectedTime, totalDuration);
    const groupNote = groupSize > 1 ? `Booking for Group of ${groupSize}\n` : '';
    const appointmentData = {
      client_name: formData.name.trim(),
      client_phone: formData.phone.trim(),
      client_email: formData.email.trim() || null,
      service_id: selectedService.id,
      service_name: selectedService.name,
      service_price: totalPrice,
      service_duration: totalDuration,
      appointment_date: toDateString(selectedDate),
      start_time: selectedTime,
      end_time: endTime,
      status: 'pending' as const,
      notes: groupNote + (formData.notes.trim() ? formData.notes.trim() + '\n' : '') + `Payment Method: Manual Transfer (${paymentOption === 'full' ? 'Full' : 'Half'} Payment)`,
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
    setSelectedCategory(null);
    setSelectedDate(null);
    setSelectedTime('');
    setGroupSize(1);
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setConfirmedAppointment(null);
    setError('');
  };

  if (loading) {
    return (
      <section className="pt-32 pb-24 min-h-screen section-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </section>
    );
  }

  if (step === 'success' && confirmedAppointment) {
    return (
      <section className="pt-32 pb-24 min-h-screen section-light flex items-center">
        <div className="container-lux max-w-2xl">
          <div className="card-lux p-10 md:p-14 text-center animate-scale-in shadow-2xl border border-rose-100">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-rose-50">
              <PartyPopper className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="heading-serif text-4xl mb-4 text-gray-900">
              Appointment Requested!
            </h2>
            <p className="leading-relaxed mb-8 text-rose-500">
              Thank you so much, {confirmedAppointment.client_name}! I have received your booking request.
              I will personally confirm your appointment with you via WhatsApp or phone shortly. I can't wait to see you!
            </p>

            <div className="rounded-2xl p-6 text-left space-y-3 mb-8 bg-rose-50 border border-rose-100">
              {[
                { l: 'Service', v: confirmedAppointment.service_name },
                { l: 'Date', v: new Date(confirmedAppointment.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
                { l: 'Time', v: `${formatTime(confirmedAppointment.start_time)} – ${formatTime(confirmedAppointment.end_time)}` },
              ].map((row) => (
                <div key={row.l} className="flex justify-between items-center pb-3 border-b border-rose-100">
                  <span className="text-sm text-gray-700">{row.l}</span>
                  <span className="font-medium text-sm text-gray-900">{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-gray-700">Price</span>
                <span className="font-serif text-2xl text-rose-500">
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
              <button onClick={() => router.push('/')} className="btn-outline text-sm flex-1">
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
            <span className="w-8 h-px bg-rose-200" />
            Book Your Visit
            <span className="w-8 h-px bg-rose-200" />
          </span>
          <h1 className="heading-serif text-4xl md:text-5xl mt-4 text-gray-900">
            Reserve Your <span className="italic text-rose-500">Moment</span>
          </h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex flex-col items-center gap-2 ${idx <= currentStepIndex ? '' : 'opacity-30'}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300"
                  style={{
                    background: idx < currentStepIndex ? '#f43f5e'
                      : idx === currentStepIndex ? '#ffe4e6'
                      : 'rgba(255,255,255,0.5)',
                    color: idx < currentStepIndex ? '#d5b1a3'
                      : idx === currentStepIndex ? '#f43f5e'
                      : '#5a4850',
                    border: idx === currentStepIndex ? '2px solid #e5e7eb' : '1px solid #ffe4e6',
                    boxShadow: idx === currentStepIndex ? '0 0 20px #ffe4e6' : 'none',
                  }}>
                  {idx < currentStepIndex ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <span className="text-[10px] sm:text-xs font-medium" style={{ color: idx === currentStepIndex ? '#f43f5e' : '#6b7280' }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 sm:w-12 md:w-20 h-px mx-2 transition-colors ${idx < currentStepIndex ? 'bg-rose-500' : 'bg-rose-100'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step: Service */}
        {step === 'service' && !selectedCategory && (
          <div className="grid md:grid-cols-3 gap-6 animate-fade-up">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="group cursor-pointer rounded-3xl overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
              >
                <div className="aspect-[4/5] relative">
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="750"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-center text-center">
                    <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-white/80 font-medium mb-4 text-sm">
                      {cat.description}
                    </p>
                    <button className="bg-rose-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-rose-600 transition-colors shadow-lg text-sm w-full">
                      Select Category
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'service' && selectedCategory && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {CATEGORIES.find(c => c.id === selectedCategory)?.title}
              </h2>
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Categories
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {services.filter(s => s.category === selectedCategory && s.is_active !== false).length === 0 ? (
                <div className="col-span-full text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-gray-500 font-medium">No services currently available in this category.</p>
                </div>
              ) : (
                services.filter(s => s.category === selectedCategory && s.is_active !== false).map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep('datetime');
                    }}
                    className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-rose-200 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-rose-600 transition-colors pr-4">
                          {service.name}
                        </h3>
                        <span className="font-extrabold text-lg text-gray-900 bg-gray-50 px-3 py-1 rounded-lg shrink-0">
                          {formatNaira(service.price)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed mb-6 text-gray-500 line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                    
                    <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {service.duration_text || formatDuration(service.duration_minutes)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === 'datetime' && selectedService && (
          <div className="card-modern shadow-xl p-8 md:p-10 animate-fade-up border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{selectedService.name}</h3>
                <p className="text-sm text-gray-500 font-medium">
                  {formatNaira(totalPrice)} · {formatDuration(totalDuration)}
                  {groupSize > 1 ? ` (For ${groupSize} people)` : ''}
                </p>
              </div>
              <button onClick={() => setStep('service')} className="text-gray-500 hover:text-black font-medium text-sm flex items-center transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Change
              </button>
            </div>

            <div className="mb-8 p-5 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1">Booking Size</h4>
                <p className="text-xs text-gray-500 font-medium">Will you be coming alone or with others?</p>
              </div>
              <div className="flex items-center bg-white rounded-full border border-gray-200 p-1">
                <button 
                  className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${groupSize === 1 ? 'bg-rose-500 text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                  onClick={() => { setGroupSize(1); setSelectedTime(''); }}
                >
                  Just Me
                </button>
                <div className={`flex items-center px-2 transition-all ${groupSize > 1 ? 'bg-rose-500 text-white rounded-full shadow-md' : 'text-gray-500'}`}>
                  <button 
                    className="p-2 hover:opacity-70 disabled:opacity-30"
                    disabled={groupSize <= 1}
                    onClick={() => { setGroupSize(prev => Math.max(1, prev - 1)); setSelectedTime(''); }}
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-12 text-center">
                    {groupSize > 1 ? `${groupSize} Ppl` : 'Group'}
                  </span>
                  <button 
                    className="p-2 hover:opacity-70 disabled:opacity-30"
                    disabled={groupSize >= 6}
                    onClick={() => { setGroupSize(prev => prev + 1); setSelectedTime(''); }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
              Select a Date
            </h4>
            <DatePicker
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              getWorkingHours={getWorkingHours}
            />

            {selectedDate && (
              <>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 mt-8 text-rose-500">
                  Available Times
                  {checkingAvailability && (
                    <Loader2 className="w-4 h-4 inline ml-2 animate-spin text-rose-500" />
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
                          background: selectedTime === slot ? '#f43f5e' : 'rgba(255,255,255,0.4)',
                          color: selectedTime === slot ? '#d5b1a3' : '#f43f5e',
                          border: `1px solid ${selectedTime === slot ? '#f43f5e' : '#ffe4e6'}`,
                        }}
                      >
                        {formatTimeShort(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl p-6 text-center bg-red-50 border border-red-200">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-red-600">
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
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 md:p-10 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl text-gray-900">Your Details</h3>
              <button onClick={() => setStep('datetime')} className="text-gray-500 hover:text-rose-500 font-bold transition-colors flex items-center gap-1 text-sm">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="rounded-xl p-4 mb-6 flex items-center gap-3 bg-gray-50 border border-rose-200">
              <Calendar className="w-5 h-5 shrink-0 text-rose-500" />
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">{selectedService.name}</span>
                {' · '}
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' at '}
                {formatTime(selectedTime)}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-2xl px-5 py-4 pl-10 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-medium" placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-2xl px-5 py-4 pl-10 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-medium" placeholder="e.g. 0801 234 5678" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email (optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
                  <input type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-2xl px-5 py-4 pl-10 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-medium" placeholder="you@email.com" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Notes (optional)</label>
                <textarea value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-2xl px-5 py-4 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all font-medium resize-none" rows={3}
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
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] shadow-lg flex justify-center items-center gap-2 w-full mt-6 py-4"
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
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 md:p-10 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl text-gray-900">Confirm Your Booking</h3>
              <button onClick={() => setStep('details')} className="text-gray-500 hover:text-rose-500 font-bold transition-colors flex items-center gap-1 text-sm">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>

            <div className="space-y-1 mb-8">
              {[
                { l: 'Service', v: selectedService.name + (groupSize > 1 ? ` (Group of ${groupSize})` : '') },
                { l: 'Date', v: selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                { l: 'Time', v: `${formatTime(selectedTime)} – ${formatTime(addMinutesToTime(selectedTime, totalDuration))}` },
                { l: 'Name', v: formData.name },
                { l: 'Phone', v: formData.phone },
                ...(formData.email ? [{ l: 'Email', v: formData.email }] : []),
              ].map((row) => (
                <div key={row.l} className="flex justify-between items-center py-3 border-b border-rose-100">
                  <span className="text-sm text-gray-700">{row.l}</span>
                  <span className="font-medium text-sm text-gray-900">{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-700">Total</span>
                <span className="font-serif text-2xl text-rose-500">
                  {formatNaira(totalPrice)}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-5 mb-6 space-y-4"
              style={{ background: '#ffe4e6', border: '1px solid #e5e7eb' }}>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                <p className="text-sm font-medium text-rose-500">
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
                    <span className="text-sm font-medium text-gray-900">Pay Full Amount</span>
                  </div>
                  <span className="font-serif text-lg text-rose-500">{formatNaira(totalPrice)}</span>
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
                      <span className="text-sm font-medium text-gray-900">Pay 50% Deposit</span>
                      <span className="text-xs text-rose-500">Balance due at studio</span>
                    </div>
                  </div>
                  <span className="font-serif text-lg text-rose-500">{formatNaira(totalPrice / 2)}</span>
                </label>
              </div>
            </div>

            <div className="rounded-xl p-5 mb-6 text-center space-y-3"
              style={{ background: '#fdfbf9', border: '1px dashed #b38b9e' }}>
              <p className="text-sm font-medium text-rose-500">Please transfer exactly <span className="font-serif font-bold text-lg">{formatNaira(amountToPay)}</span> to:</p>
              
              <div className="bg-white rounded-lg p-4 inline-block text-left shadow-sm">
                <p className="text-xs uppercase tracking-wider mb-1 text-gray-700">Bank Name</p>
                <p className="font-bold text-lg mb-3 text-gray-900">OPay</p>
                
                <p className="text-xs uppercase tracking-wider mb-1 text-gray-700">Account Number</p>
                <p className="font-bold text-2xl tracking-widest mb-3 text-rose-500">8087026970</p>
                
                <p className="text-xs uppercase tracking-wider mb-1 text-gray-700">Account Name</p>
                <p className="font-bold text-lg text-gray-900">Samaila Florence</p>
              </div>
              <p className="text-xs text-rose-500">I will verify your transfer and confirm your booking via WhatsApp.</p>
            </div>

            {error && (
              <p className="text-sm mb-4 text-center flex items-center justify-center gap-1.5" style={{ color: 'rgba(200,80,80,0.8)' }}>
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={submitting} className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] shadow-lg flex justify-center items-center gap-2 w-full disabled:opacity-60 py-4">
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
    <div className="rounded-2xl p-3 sm:p-5" style={{ background: '#fdfbf9', border: '1px solid #ffe4e6' }}>
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: '#ffe4e6' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffe4e6')}
        >
          <ChevronLeft className="w-5 h-5 text-rose-500" />
        </button>
        <h4 className="font-serif text-lg font-medium text-gray-900">
          {monthNames[month]} {year}
        </h4>
        <button
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: '#ffe4e6' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffe4e6')}
        >
          <ChevronRight className="w-5 h-5 text-rose-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold py-2 text-rose-500">
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
              className={`aspect-square min-h-[40px] rounded-lg text-sm font-semibold transition-all duration-200 ${isDisabled ? 'opacity-40 line-through' : ''}`}
              style={{
                background: isSelected ? '#f43f5e' : 'transparent',
                color: isSelected ? '#fdfbf9'
                  : isDisabled ? '#9ca3af' // darker gray for contrast
                  : '#f43f5e',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!isDisabled && !isSelected) e.currentTarget.style.background = '#ffe4e6'; }}
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

