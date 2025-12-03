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
}

interface EventsCoverflowProps {
  events: EventItem[];
  onEventChange?: (event: EventItem, index: number) => void;
  autoplayDelay?: number;
}

export default function EventsCoverflow({
  events,
  onEventChange,
  autoplayDelay = 8000
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
          depth: 200,
          modifier: 2.5,
          slideShadows: false,
        }}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
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
            <div
              className={`beer-can ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleSlideClick(index)}
            >
              {/* Can Top Rim */}
              <div className="can-top">
                <div className="can-top-inner"></div>
              </div>

              {/* Can Body */}
              <div className="can-body">
                {/* Metallic highlight overlay */}
                <div className="can-highlight"></div>

                {/* Event Image as Label */}
                <div
                  className="can-label"
                  style={{ backgroundImage: `url(${event.image})` }}
                >
                  <span className="can-featured-badge">Featured</span>
                </div>

                {/* Event Info */}
                <div className="can-info">
                  <h4 className="can-title">{event.title}</h4>
                  <p className="can-date">{event.date}</p>
                  <p className="can-location">{event.location}</p>
                </div>
              </div>

              {/* Can Bottom Rim */}
              <div className="can-bottom">
                <div className="can-bottom-inner"></div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
