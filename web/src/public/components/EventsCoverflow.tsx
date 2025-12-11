import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay, Virtual } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export interface EventTag {
  name: string;
  color: string;
  category: string;
}

export interface EventItem {
  id: string;
  image: string;
  title: string;
  date: string;
  location: string;
  description: string;
  tags: EventTag[];
  // Optional styling properties
  canColor?: string;
  canImage?: string; // Background image for the can (replaces canColor if provided)
  accentColor?: string;
  breweryName?: string;
  beerStyle?: string;
}

interface EventsCoverflowProps {
  events: EventItem[];
  onEventChange?: (event: EventItem, index: number) => void;
  autoplayDelay?: number;
  externalPagination?: boolean;
}

// Default colors using brand palette
const defaultCanColor = '#1f3540';
const defaultAccentColor = '#fd5526';

interface BeerCanProps {
  event: EventItem;
  isActive: boolean;
  onClick: () => void;
}

function BeerCan({ event, isActive, onClick }: BeerCanProps) {
  const canColor = event.canColor || defaultCanColor;
  const canImage = event.canImage;
  const accentColor = event.accentColor || defaultAccentColor;
  const breweryName = event.breweryName || 'BrewedAt';
  const beerStyle = event.beerStyle || 'CRAFT';

  const canWidth = 210;
  const canHeight = 340;
  const topHeight = 28;

  // Always use canColor for can background
  const canBackgroundStyle: React.CSSProperties = {
    background: canColor
  };

  // Hide label text when using an image background
  const showLabel = !canImage;

  // Image dimensions for 4:5 aspect ratio that fits nicely in the can
  const imageWidth = canWidth - 24; // 12px margin on each side
  const imageHeight = imageWidth * (5 / 4); // 4:5 aspect ratio

  return (
    <div
      className={`beer-can ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transform: isActive ? 'scale(1.08) translateY(-8px)' : 'scale(0.92)',
        opacity: isActive ? 1 : 0.7,
        transition: 'all 0.4s ease-out',
        zIndex: isActive ? 10 : 1,
        position: 'relative'
      }}
    >
      {/* Can Container */}
      <div style={{
        width: `${canWidth + 20}px`,
        height: `${canHeight + topHeight + 15}px`,
        position: 'relative',
        filter: isActive ? 'drop-shadow(0 20px 30px rgba(0,0,0,0.25))' : 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))'
      }}>

        {/* Can Top - matches body width */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${canWidth}px`,
          height: `${topHeight}px`,
          background: '#a8a8a8',
          borderRadius: '50%',
          zIndex: 20
        }}>
          {/* Inner rim */}
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${canWidth - 28}px`,
            height: `${topHeight - 12}px`,
            background: '#888',
            borderRadius: '50%'
          }} />
          {/* Pull Tab */}
          <div style={{
            position: 'absolute',
            top: '7px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '12px',
            background: '#999',
            borderRadius: '5px'
          }}>
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '7px',
              height: '4px',
              background: '#666',
              borderRadius: '2px'
            }} />
          </div>
        </div>

        {/* Main Can Body - same width as top */}
        <div style={{
          position: 'absolute',
          top: `${topHeight / 2}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${canWidth}px`,
          height: `${canHeight}px`,
          ...canBackgroundStyle,
          borderRadius: '4px 4px 6px 6px',
          overflow: 'hidden'
        }}>

          {/* Subtle left edge shadow */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '20px',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 100%)'
          }} />

          {/* Subtle right highlight */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: '20px',
            width: '28px',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
          }} />

          {/* Label Area - only show when not using image background */}
          {showLabel && (
            <div style={{
              position: 'absolute',
              top: '35px',
              left: '16px',
              right: '16px',
              bottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 10px'
            }}>

              {/* Beer Style */}
              <div style={{
                color: accentColor,
                fontSize: '12px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '600',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                opacity: 0.9
              }}>
                {beerStyle}
              </div>

              {/* Brewery Name */}
              <div style={{
                color: '#fff',
                fontSize: '24px',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.2',
                letterSpacing: '0.5px'
              }}>
                {breweryName}
              </div>

              {/* Simple Divider */}
              <div style={{
                width: '55px',
                height: '2px',
                background: accentColor,
                opacity: 0.5
              }} />

              {/* Event Name */}
              <div style={{
                color: accentColor,
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                textAlign: 'center',
                lineHeight: '1.3'
              }}>
                {event.title}
              </div>

              {/* Date */}
              <div style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '600'
              }}>
                {event.date}
              </div>

              {/* Location */}
              <div style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '11px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '400',
                letterSpacing: '0.3px'
              }}>
                {event.location}
              </div>

              {/* Simple decorative element */}
              <div style={{
                width: '42px',
                height: '42px',
                border: `1px solid ${accentColor}`,
                borderRadius: '50%',
                opacity: 0.3
              }} />
            </div>
          )}

          {/* Bottom accent stripe - only show when not using image background */}
          {showLabel && (
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '16px',
              background: accentColor,
              opacity: 0.4
            }} />
          )}

          {/* Image layout - show when canImage is provided */}
          {canImage && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 12px'
            }}>
              {/* Image frame */}
              <div style={{
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                borderRadius: '4px',
                overflow: 'hidden',
                border: `2px solid ${accentColor}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}>
                <img
                  src={canImage}
                  alt={event.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Can Bottom - matches body width */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${canWidth}px`,
          height: '14px',
          background: '#777',
          borderRadius: '50%',
          zIndex: 1
        }} />
      </div>
    </div>
  );
}

export default function EventsCoverflow({
  events,
  onEventChange,
  autoplayDelay = 8000,
  externalPagination = false
}: EventsCoverflowProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Notify parent of initial event on mount
  useEffect(() => {
    if (events.length > 0 && onEventChange) {
      onEventChange(events[0], 0);
    }
  }, []);

  const handleSlideChange = (swiper: SwiperType) => {
    const realIndex = swiper.realIndex;
    setActiveIndex(realIndex);
    if (onEventChange && events[realIndex]) {
      onEventChange(events[realIndex], realIndex);
    }
  };

  const handleSlideClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
    }
  };

  // Use virtualization for large datasets (100+ items)
  const useVirtual = events.length > 20;

  return (
    <div className="events-coverflow-wrapper">
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={events.length > 3}
        speed={600}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 1.5,
          slideShadows: false,
        }}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={externalPagination ? false : {
          clickable: true,
          dynamicBullets: events.length > 10,
          dynamicMainBullets: 5,
        }}
        navigation={true}
        modules={[EffectCoverflow, Pagination, Navigation, Autoplay, ...(useVirtual ? [Virtual] : [])]}
        virtual={useVirtual ? {
          enabled: true,
          addSlidesAfter: 3,
          addSlidesBefore: 3,
        } : undefined}
        className="events-coverflow-swiper"
      >
        {events.map((event, index) => (
          <SwiperSlide
            key={event.id || index}
            virtualIndex={useVirtual ? index : undefined}
            className="events-coverflow-slide"
          >
            <BeerCan
              event={event}
              isActive={index === activeIndex}
              onClick={() => handleSlideClick(index)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
