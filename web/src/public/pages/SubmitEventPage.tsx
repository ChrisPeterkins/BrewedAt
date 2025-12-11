import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@shared/api-client';
import type { Tag } from '@shared/api-client';

// Tag category display names and colors
const TAG_CATEGORIES: Record<string, { label: string; color: string }> = {
  'entertainment': { label: 'Entertainment', color: '#9333EA' },
  'video-games': { label: 'Video Games', color: '#EF4444' },
  'beverages': { label: 'Beverages', color: '#F59E0B' },
  'event-focus': { label: 'Event Focus', color: '#3B82F6' },
  'activity': { label: 'Activity', color: '#14B8A6' },
  'sports': { label: 'Sports', color: '#F97316' },
};

const STEPS = [
  { id: 1, title: 'Event Info', icon: '📅' },
  { id: 2, title: 'Location', icon: '📍' },
  { id: 3, title: 'Details', icon: '🏷️' },
  { id: 4, title: 'Contact', icon: '👤' },
];

// Beer Pour Celebration Animation Component
const BeerPourCelebration = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 100),    // Start pour
      setTimeout(() => setStage(2), 1200),   // Beer filled
      setTimeout(() => setStage(3), 1600),   // Foam appears
      setTimeout(() => setStage(4), 2000),   // Celebration
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={celebrationStyles.container}>
      {/* Background bubbles */}
      <div style={celebrationStyles.bubblesContainer}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              ...celebrationStyles.bgBubble,
              left: `${10 + (i * 7)}%`,
              animationDelay: `${i * 0.3}s`,
              width: 8 + (i % 3) * 4,
              height: 8 + (i % 3) * 4,
            }}
          />
        ))}
      </div>

      {/* Confetti */}
      {stage >= 4 && (
        <div style={celebrationStyles.confettiContainer}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                ...celebrationStyles.confetti,
                left: `${5 + (i * 4.5)}%`,
                backgroundColor: ['#fd5526', '#F5B041', '#D4A03E', '#10B981', '#3B82F6'][i % 5],
                animationDelay: `${i * 0.1}s`,
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Beer Glass */}
      <div style={celebrationStyles.glassWrapper}>
        <svg width="170" height="195" viewBox="0 0 170 195" fill="none">
          {/* Glass outline */}
          <defs>
            <clipPath id="glassClip">
              <path d="M25 35 L30 165 C30 172 40 175 70 175 C100 175 110 172 110 165 L115 35 Z" />
            </clipPath>
            <linearGradient id="beerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5B041" />
              <stop offset="100%" stopColor="#D4A03E" />
            </linearGradient>
            <linearGradient id="foamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF5" />
              <stop offset="100%" stopColor="#FFF8E7" />
            </linearGradient>
          </defs>

          {/* Glass background (empty) */}
          <path
            d="M25 35 L30 165 C30 172 40 175 70 175 C100 175 110 172 110 165 L115 35 Z"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />

          {/* Beer fill */}
          <g clipPath="url(#glassClip)">
            <rect
              x="20"
              y={stage >= 1 ? 40 : 180}
              width="100"
              height="150"
              fill="url(#beerGradient)"
              style={{
                transition: 'y 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />

            {/* Bubbles inside beer */}
            {stage >= 2 && [...Array(8)].map((_, i) => (
              <circle
                key={i}
                cx={40 + (i * 10)}
                cy={100 + (i % 3) * 20}
                r={2 + (i % 2)}
                fill="rgba(255,255,255,0.4)"
                style={{
                  animation: `riseBubble ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </g>

          {/* Foam */}
          {stage >= 3 && (
            <g style={{ animation: 'foamAppear 0.5s ease-out forwards' }}>
              <ellipse cx="70" cy="42" rx="42" ry="12" fill="url(#foamGradient)" />
              <ellipse cx="45" cy="38" rx="18" ry="10" fill="#FFFDF5" />
              <ellipse cx="70" cy="35" rx="22" ry="12" fill="#FFFDF5" />
              <ellipse cx="95" cy="38" rx="18" ry="10" fill="#FFFDF5" />
              <ellipse cx="55" cy="32" rx="12" ry="8" fill="#FFFFFF" />
              <ellipse cx="82" cy="32" rx="14" ry="9" fill="#FFFFFF" />
            </g>
          )}

          {/* Glass highlight */}
          <path
            d="M35 45 L38 155"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Handle */}
          <path
            d="M115 55 C140 55 145 70 145 90 C145 110 140 125 115 125"
            stroke="#D4A03E"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M115 55 C140 55 145 70 145 90 C145 110 140 125 115 125"
            stroke="#F5B041"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Sparkles */}
        {stage >= 4 && (
          <>
            <div style={{ ...celebrationStyles.sparkle, top: '10%', left: '10%', animationDelay: '0s' }}>✦</div>
            <div style={{ ...celebrationStyles.sparkle, top: '20%', right: '5%', animationDelay: '0.2s' }}>✦</div>
            <div style={{ ...celebrationStyles.sparkle, top: '5%', right: '20%', animationDelay: '0.4s' }}>✦</div>
            <div style={{ ...celebrationStyles.sparkle, bottom: '30%', left: '5%', animationDelay: '0.3s' }}>✦</div>
            <div style={{ ...celebrationStyles.sparkle, bottom: '40%', right: '0%', animationDelay: '0.5s' }}>✦</div>
          </>
        )}
      </div>

      {/* Cheers text */}
      {stage >= 4 && (
        <div style={celebrationStyles.cheersText}>Cheers! 🎉</div>
      )}
    </div>
  );
};

const celebrationStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    height: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glassWrapper: {
    position: 'relative',
    animation: 'glassAppear 0.6s ease-out',
  },
  bubblesContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  bgBubble: {
    position: 'absolute',
    bottom: -20,
    borderRadius: '50%',
    backgroundColor: 'rgba(212, 160, 62, 0.3)',
    animation: 'floatUp 4s ease-in-out infinite',
  },
  confettiContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: -10,
    width: 10,
    height: 10,
    borderRadius: 2,
    animation: 'confettiFall 3s ease-out forwards',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    color: '#F5B041',
    animation: 'sparkle 1s ease-in-out infinite',
  },
  cheersText: {
    position: 'absolute',
    bottom: 10,
    fontSize: 18,
    fontWeight: 700,
    color: '#D4A03E',
    animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
  },
};

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SmallArrowLeft = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SmallArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SubmitEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    eventTime: '',
    eventType: 'local',
    location: '',
    address: '',
    websiteUrl: '',
    ticketUrl: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [scrollStates, setScrollStates] = useState<Record<string, { canScrollLeft: boolean; canScrollRight: boolean }>>({});
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const MAX_TAGS = 5;

  const updateScrollState = (category: string) => {
    const el = scrollRefs.current[category];
    if (el) {
      setScrollStates(prev => ({
        ...prev,
        [category]: {
          canScrollLeft: el.scrollLeft > 0,
          canScrollRight: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
        }
      }));
    }
  };

  const scrollTags = (category: string, direction: 'left' | 'right') => {
    const el = scrollRefs.current[category];
    if (el) {
      const scrollAmount = 150;
      el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      setTimeout(() => updateScrollState(category), 300);
    }
  };

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await apiClient.getTags();
      if (response.success && response.data) {
        setAllTags(response.data);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) return prev.filter(id => id !== tagId);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tagId];
    });
  };

  // Group tags by category
  const tagsByCategory = allTags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  const nextStep = () => {
    if (currentStep < 4) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setDirection(step < currentStep ? 'backward' : 'forward');
      setCurrentStep(step);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return formData.name && formData.description && formData.eventDate;
      case 2: return formData.location && formData.address;
      case 3: return true; // Optional
      case 4: return formData.organizerName && formData.organizerEmail;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await apiClient.submitEvent({
        title: formData.name,
        description: formData.description || undefined,
        date: formData.eventDate,
        time: formData.eventTime || undefined,
        location: formData.location,
        address: formData.address || undefined,
        eventType: formData.eventType,
        organizerName: formData.organizerName,
        organizerEmail: formData.organizerEmail,
        organizerPhone: formData.organizerPhone || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        ticketUrl: formData.ticketUrl || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });

      if (response.success) {
        // If we have an image, upload it
        if (imageFile && response.data?.id) {
          try {
            await apiClient.uploadEventImage(response.data.id, imageFile);
          } catch (imgError) {
            console.error('Error uploading image:', imgError);
          }
        }
        setSubmitted(true);
      } else {
        console.error('Submission failed:', response.error);
        alert(response.error || 'Failed to submit event. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setFormData({
      name: '', description: '', eventDate: '', eventTime: '', eventType: 'local',
      location: '', address: '', websiteUrl: '', ticketUrl: '',
      organizerName: '', organizerEmail: '', organizerPhone: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedTagIds([]);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .form-input:focus {
          border-color: #fd5526 !important;
          box-shadow: 0 0 0 3px rgba(253, 85, 38, 0.15) !important;
        }
        .form-input::placeholder { color: #9CA3AF; }

        .btn-primary:hover:not(:disabled) {
          background-color: #e64a1f !important;
          transform: translateY(-1px);
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: #F3F4F6 !important;
        }

        .image-upload-label:hover {
          border-color: #fd5526 !important;
          background-color: #FFF7F5 !important;
        }

        .tag-btn:hover:not(:disabled) { transform: scale(1.03); }

        .step-clickable:hover {
          transform: scale(1.05);
        }

        /* Hide scrollbars for tags */
        .tags-list-scroll::-webkit-scrollbar {
          display: none;
        }

        /* Carousel arrow hover */
        .carousel-arrow:hover {
          background-color: #F3F4F6 !important;
          border-color: #D1D5DB !important;
          color: #374151 !important;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes checkPop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        /* Beer celebration animations */
        @keyframes glassAppear {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-100px) scale(0.8); opacity: 0.6; }
          100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
        }
        @keyframes riseBubble {
          0% { transform: translateY(0); opacity: 0.4; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes foamAppear {
          from { opacity: 0; transform: translateY(10px) scaleY(0.5); }
          to { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(350px) rotate(720deg); opacity: 0; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .slide-in-right { animation: slideInRight 0.35s ease-out; }
        .slide-in-left { animation: slideInLeft 0.35s ease-out; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        .scale-in { animation: scaleIn 0.4s ease-out; }
        .text-reveal { animation: textReveal 0.5s ease-out forwards; }
        .text-reveal-delay-1 { animation: textReveal 0.5s ease-out 0.3s forwards; opacity: 0; }
        .text-reveal-delay-2 { animation: textReveal 0.5s ease-out 0.5s forwards; opacity: 0; }
        .text-reveal-delay-3 { animation: textReveal 0.5s ease-out 2.2s forwards; opacity: 0; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <h1 style={styles.headerTitle}>Submit an Event</h1>
          <p style={styles.headerSubtitle}>Share your craft beverage event with the BrewedAt community</p>
        </div>

        <div style={styles.formContainer}>
          {submitted ? (
            <div style={styles.success}>
              <BeerPourCelebration />

              <h2 className="text-reveal-delay-3" style={styles.successTitle}>
                Event Submitted!
              </h2>
              <p className="text-reveal-delay-3" style={styles.successText}>
                Thanks for sharing your event. Our team will review it and get back to you soon.
              </p>
              <button
                onClick={resetForm}
                className="btn-primary text-reveal-delay-3"
                style={{ ...styles.primaryButton, opacity: 0, animation: 'textReveal 0.5s ease-out 2.4s forwards', margin: '0 auto' }}
              >
                Submit Another Event
              </button>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div style={styles.stepper}>
                {STEPS.map((step, index) => {
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  const isClickable = step.id <= currentStep;

                  return (
                    <div key={step.id} style={styles.stepWrapper}>
                      <button
                        onClick={() => goToStep(step.id)}
                        disabled={!isClickable}
                        className={isClickable ? 'step-clickable' : ''}
                        style={{
                          ...styles.stepButton,
                          cursor: isClickable ? 'pointer' : 'default',
                        }}
                      >
                        <div style={{
                          ...styles.stepCircle,
                          backgroundColor: isCompleted ? '#10B981' : isCurrent ? '#fd5526' : '#E5E7EB',
                          color: isCompleted || isCurrent ? '#fff' : '#9CA3AF',
                          transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isCurrent ? '0 4px 12px rgba(253, 85, 38, 0.3)' : 'none',
                        }}>
                          {isCompleted ? (
                            <span style={{ animation: 'checkPop 0.3s ease-out' }}><CheckIcon /></span>
                          ) : (
                            <span style={{ fontSize: 16 }}>{step.icon}</span>
                          )}
                        </div>
                        <span style={{
                          ...styles.stepLabel,
                          color: isCurrent ? '#1f3540' : isCompleted ? '#10B981' : '#9CA3AF',
                          fontWeight: isCurrent ? 600 : 500,
                        }}>
                          {step.title}
                        </span>
                      </button>

                      {index < STEPS.length - 1 && (
                        <div style={styles.stepConnector}>
                          <div style={{
                            ...styles.stepConnectorFill,
                            width: isCompleted ? '100%' : '0%',
                          }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar (mobile-friendly alternative) */}
              <div style={styles.progressBarContainer}>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                  }} />
                </div>
                <span style={styles.progressText}>Step {currentStep} of {STEPS.length}</span>
              </div>

              {/* Form Content */}
              <div
                key={currentStep}
                className={direction === 'forward' ? 'slide-in-right' : 'slide-in-left'}
                style={styles.formContent}
              >
                {/* Step 1: Event Info */}
                {currentStep === 1 && (
                  <div style={styles.stepContent}>
                    <div style={styles.stepHeader}>
                      <h2 style={styles.stepTitle}>Tell us about your event</h2>
                      <p style={styles.stepDescription}>Start with the basics — what's the event called and when is it?</p>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Event Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        style={styles.input}
                        placeholder="Summer Beer Festival"
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="form-input"
                        style={styles.textarea}
                        placeholder="Tell us what makes your event special..."
                      />
                    </div>

                    <div style={styles.fieldRow}>
                      <div style={styles.fieldHalf}>
                        <label style={styles.label}>Date *</label>
                        <input
                          type="date"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleChange}
                          className="form-input"
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.fieldHalf}>
                        <label style={styles.label}>Time (optional)</label>
                        <input
                          type="text"
                          name="eventTime"
                          value={formData.eventTime}
                          onChange={handleChange}
                          placeholder="6 PM - 10 PM"
                          className="form-input"
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <div style={styles.stepContent}>
                    <div style={styles.stepHeader}>
                      <h2 style={styles.stepTitle}>Where is it happening?</h2>
                      <p style={styles.stepDescription}>Help attendees find your event.</p>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Venue Name *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-input"
                        style={styles.input}
                        placeholder="Love City Brewing"
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Full Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="form-input"
                        style={styles.input}
                        placeholder="1023 Hamilton St, Philadelphia, PA 19123"
                      />
                    </div>

                    <div style={styles.fieldRow}>
                      <div style={styles.fieldHalf}>
                        <label style={styles.label}>Website URL (optional)</label>
                        <input
                          type="url"
                          name="websiteUrl"
                          value={formData.websiteUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                          className="form-input"
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.fieldHalf}>
                        <label style={styles.label}>Ticket URL (optional)</label>
                        <input
                          type="url"
                          name="ticketUrl"
                          value={formData.ticketUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                          className="form-input"
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Image & Tags */}
                {currentStep === 3 && (
                  <div style={styles.stepContent}>
                    <div style={styles.stepHeader}>
                      <h2 style={styles.stepTitle}>Make it stand out</h2>
                      <p style={styles.stepDescription}>Add an image and tags to help people discover your event.</p>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Event Image (optional)</label>
                      {imagePreview ? (
                        <div style={styles.imagePreviewWrapper}>
                          <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                          <button type="button" onClick={removeImage} style={styles.removeImageButton}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                              <circle cx="14" cy="14" r="14" fill="rgba(0,0,0,0.7)" />
                              <path d="M18 10L10 18M10 10L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="image-upload-label" style={styles.imageUploadLabel}>
                          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 8, opacity: 0.5 }}>
                            <path d="M35 25V31.6667C35 33.5076 33.5076 35 31.6667 35H8.33333C6.49238 35 5 33.5076 5 31.6667V25" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M28.3333 13.3333L20 5L11.6667 13.3333" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 5V25" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                          <span style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>Click to upload an image</span>
                          <span style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>PNG, JPG up to 5MB</span>
                        </label>
                      )}
                    </div>

                    {allTags.length > 0 && (
                      <div style={styles.field}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <label style={styles.label}>Event Tags (optional)</label>
                          <span style={styles.tagCounter}>{selectedTagIds.length}/{MAX_TAGS}</span>
                        </div>
                        <div style={styles.tagsContainer}>
                          {Object.entries(tagsByCategory).map(([category, tags]) => {
                            const scrollState = scrollStates[category] || { canScrollLeft: false, canScrollRight: true };
                            return (
                              <div key={category} style={styles.tagCategory}>
                                <h4 style={{ ...styles.tagCategoryTitle, color: TAG_CATEGORIES[category]?.color || '#6B7280' }}>
                                  {TAG_CATEGORIES[category]?.label || category}
                                </h4>
                                <div style={styles.tagsRow}>
                                  {scrollState.canScrollLeft && (
                                    <button
                                      type="button"
                                      onClick={() => scrollTags(category, 'left')}
                                      className="carousel-arrow"
                                      style={styles.carouselArrow}
                                    >
                                      <SmallArrowLeft />
                                    </button>
                                  )}
                                  <div
                                    ref={(el) => {
                                      scrollRefs.current[category] = el;
                                      if (el && !scrollStates[category]) {
                                        setTimeout(() => updateScrollState(category), 100);
                                      }
                                    }}
                                    onScroll={() => updateScrollState(category)}
                                    className="tags-list-scroll"
                                    style={styles.tagsList}
                                  >
                                    {tags.map(tag => {
                                      const isSelected = selectedTagIds.includes(tag.id);
                                      const isDisabled = !isSelected && selectedTagIds.length >= MAX_TAGS;
                                      return (
                                        <button
                                          key={tag.id}
                                          type="button"
                                          onClick={() => toggleTag(tag.id)}
                                          disabled={isDisabled}
                                          className="tag-btn"
                                          style={{
                                            ...styles.tagButton,
                                            backgroundColor: isSelected ? TAG_CATEGORIES[tag.category]?.color || '#D4A03E' : 'transparent',
                                            borderColor: TAG_CATEGORIES[tag.category]?.color || '#D4A03E',
                                            color: isSelected ? '#FFF' : TAG_CATEGORIES[tag.category]?.color || '#D4A03E',
                                            opacity: isDisabled ? 0.4 : 1,
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                          }}
                                        >
                                          {tag.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {scrollState.canScrollRight && (
                                    <button
                                      type="button"
                                      onClick={() => scrollTags(category, 'right')}
                                      className="carousel-arrow"
                                      style={styles.carouselArrow}
                                    >
                                      <SmallArrowRight />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Contact */}
                {currentStep === 4 && (
                  <div style={styles.stepContent}>
                    <div style={styles.stepHeader}>
                      <h2 style={styles.stepTitle}>How can we reach you?</h2>
                      <p style={styles.stepDescription}>We'll use this to contact you about your submission. This won't be published.</p>
                    </div>

                    <div style={styles.fieldRow}>
                      <div style={styles.fieldHalf}>
                        <label style={styles.label}>Your Name *</label>
                        <input
                          type="text"
                          name="organizerName"
                          value={formData.organizerName}
                          onChange={handleChange}
                          className="form-input"
                          style={styles.input}
                          placeholder="John Doe"
                        />
                      </div>
                      <div style={styles.fieldHalf}>
                        <label style={styles.label}>Email *</label>
                        <input
                          type="email"
                          name="organizerEmail"
                          value={formData.organizerEmail}
                          onChange={handleChange}
                          className="form-input"
                          style={styles.input}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Phone (optional)</label>
                      <input
                        type="tel"
                        name="organizerPhone"
                        value={formData.organizerPhone}
                        onChange={handleChange}
                        className="form-input"
                        style={styles.input}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div style={styles.navigation}>
                {currentStep > 1 ? (
                  <button onClick={prevStep} className="btn-secondary" style={styles.secondaryButton}>
                    <ArrowLeft /> Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="btn-primary"
                    style={{
                      ...styles.primaryButton,
                      opacity: isStepValid(currentStep) ? 1 : 0.5,
                      cursor: isStepValid(currentStep) ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Continue <ArrowRight />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isStepValid(4) || submitting}
                    className="btn-primary"
                    style={{
                      ...styles.primaryButton,
                      opacity: isStepValid(4) && !submitting ? 1 : 0.5,
                      cursor: isStepValid(4) && !submitting ? 'pointer' : 'not-allowed',
                      minWidth: 160,
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Event 🍺'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/brewedat/api/uploads/general/PodcastBackground2-1762980833203-514936744.jpeg) center/cover no-repeat fixed',
    padding: '40px 16px',
    fontFamily: '"DM Sans", -apple-system, sans-serif',
  },
  container: {
    maxWidth: 680,
    margin: '0 auto',
  },
  pageHeader: {
    textAlign: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 8px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '32px 28px',
    borderRadius: 20,
    boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
  },

  // Stepper
  stepper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    padding: '0 8px',
  },
  stepWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  stepButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    padding: 8,
    transition: 'transform 0.2s',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  stepLabel: {
    fontSize: 12,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  stepConnector: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: -18,
    marginLeft: -8,
    marginRight: -8,
    overflow: 'hidden',
  },
  stepConnectorFill: {
    height: '100%',
    backgroundColor: '#10B981',
    transition: 'width 0.4s ease',
  },

  // Progress bar
  progressBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    padding: '0 8px',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fd5526',
    transition: 'width 0.4s ease',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  // Form content
  formContent: {
    minHeight: 320,
  },
  stepContent: {},
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1f3540',
    margin: '0 0 6px',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    margin: 0,
  },

  // Fields
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 18,
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 18,
  },
  fieldHalf: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '12px 14px',
    border: '2px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
    backgroundColor: '#FAFAFA',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '12px 14px',
    border: '2px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
    backgroundColor: '#FAFAFA',
    resize: 'vertical',
    minHeight: 100,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  },

  // Image upload
  imageUploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    border: '2px dashed #D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    borderRadius: 12,
    objectFit: 'contain',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },

  // Tags
  tagCounter: {
    fontSize: 12,
    fontWeight: 600,
    color: '#fd5526',
    backgroundColor: '#FFF7F5',
    padding: '4px 10px',
    borderRadius: 12,
  },
  tagsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  tagCategory: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  tagCategoryTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: 0,
  },
  tagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 6,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    flex: 1,
  },
  carouselArrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '1px solid #E5E7EB',
    backgroundColor: '#fff',
    color: '#6B7280',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  tagButton: {
    padding: '5px 12px',
    borderRadius: 16,
    border: '2px solid',
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  // Review box
  reviewBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    border: '1px solid #E5E7EB',
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 14px',
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  reviewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  reviewValue: {
    fontSize: 14,
    color: '#1f3540',
    fontWeight: 500,
  },

  // Navigation
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    paddingTop: 24,
    borderTop: '1px solid #E5E7EB',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 28px',
    backgroundColor: '#fd5526',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(253, 85, 38, 0.25)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '14px 20px',
    backgroundColor: '#fff',
    color: '#374151',
    border: '2px solid #E5E7EB',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Success
  success: {
    textAlign: 'center',
    padding: '32px 24px',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1f3540',
    marginBottom: 12,
    marginTop: 16,
  },
  successText: {
    fontSize: 15,
    color: '#5a6672',
    marginBottom: 28,
    maxWidth: 340,
    margin: '0 auto 28px',
    lineHeight: 1.5,
  },
};
