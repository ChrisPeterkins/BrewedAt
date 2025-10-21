import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { HomePageContent } from '@shared/types';

const INITIAL_CONTENT: Omit<HomePageContent, 'updatedAt'> = {
  heroTitle: 'Tap into the Local Craft Beverage Scene',
  heroSubtitle: "Something's always brewing in the craft beverage scene. Stay up to date on unforgettable events, local stories, and interactive campaigns that help you discover your next favorite brewery, beverage, or bar!",
  aboutTitle: 'Connecting the Craft Beer Community',
  aboutContent: 'We create unforgettable events, compelling content, and powerful marketing campaigns that bring breweries, bars, and beer lovers together across PA & NJ.',
  statsLabel1: 'Community Members',
  statsValue1: '15,000+',
  statsLabel2: 'Events Hosted',
  statsValue2: '100+',
  statsLabel3: 'Partner Breweries',
  statsValue3: '50+',
};

export default function Content() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [formData, setFormData] = useState(INITIAL_CONTENT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'siteConfig', 'homepage');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as HomePageContent;
        setContent(data);
        setFormData({
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          aboutTitle: data.aboutTitle,
          aboutContent: data.aboutContent,
          statsLabel1: data.statsLabel1,
          statsValue1: data.statsValue1,
          statsLabel2: data.statsLabel2,
          statsValue2: data.statsValue2,
          statsLabel3: data.statsLabel3,
          statsValue3: data.statsValue3,
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      alert('Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, 'siteConfig', 'homepage');
      const dataToSave: HomePageContent = {
        ...formData,
        updatedAt: Timestamp.now(),
      };

      await setDoc(docRef, dataToSave);
      setContent(dataToSave);
      alert('Homepage content updated successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (content) {
      setFormData({
        heroTitle: content.heroTitle,
        heroSubtitle: content.heroSubtitle,
        aboutTitle: content.aboutTitle,
        aboutContent: content.aboutContent,
        statsLabel1: content.statsLabel1,
        statsValue1: content.statsValue1,
        statsLabel2: content.statsLabel2,
        statsValue2: content.statsValue2,
        statsLabel3: content.statsLabel3,
        statsValue3: content.statsValue3,
      });
    } else {
      setFormData(INITIAL_CONTENT);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#8B4513' }}>Loading homepage content...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#654321' }}>Homepage Content</h1>
        <p style={{ margin: 0, color: '#8B4513', fontSize: '14px' }}>
          Edit the text and content displayed on your public homepage
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Hero Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}>
          <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
            🎯 Hero Section
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
              Hero Title
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </label>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Main headline at the top of the homepage
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
              Hero Subtitle
              <textarea
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleInputChange}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </label>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Descriptive text under the main headline
            </p>
          </div>
        </div>

        {/* About Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}>
          <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
            📖 About Section
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
              About Title
              <input
                type="text"
                name="aboutTitle"
                value={formData.aboutTitle}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
              About Content
              <textarea
                name="aboutContent"
                value={formData.aboutContent}
                onChange={handleInputChange}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </label>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}>
          <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
            📊 Statistics Section
          </h2>
          <p style={{ color: '#8B4513', fontSize: '14px', marginBottom: '20px' }}>
            Three stats displayed on the homepage (e.g., "15,000+ Community Members")
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Stat 1 */}
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0, color: '#654321', fontSize: '14px', marginBottom: '12px' }}>Stat 1</h4>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#654321' }}>
                Value (e.g., "15,000+")
                <input
                  type="text"
                  name="statsValue1"
                  value={formData.statsValue1}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', fontSize: '13px', color: '#654321' }}>
                Label
                <input
                  type="text"
                  name="statsLabel1"
                  value={formData.statsLabel1}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </label>
            </div>

            {/* Stat 2 */}
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0, color: '#654321', fontSize: '14px', marginBottom: '12px' }}>Stat 2</h4>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#654321' }}>
                Value
                <input
                  type="text"
                  name="statsValue2"
                  value={formData.statsValue2}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', fontSize: '13px', color: '#654321' }}>
                Label
                <input
                  type="text"
                  name="statsLabel2"
                  value={formData.statsLabel2}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </label>
            </div>

            {/* Stat 3 */}
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0, color: '#654321', fontSize: '14px', marginBottom: '12px' }}>Stat 3</h4>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#654321' }}>
                Value
                <input
                  type="text"
                  name="statsValue3"
                  value={formData.statsValue3}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </label>
              <label style={{ display: 'block', fontSize: '13px', color: '#654321' }}>
                Label
                <input
                  type="text"
                  name="statsLabel3"
                  value={formData.statsLabel3}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '4px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 32px',
              backgroundColor: saving ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '12px 32px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Reset
          </button>
        </div>

        {content && (
          <p style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
            Last updated: {content.updatedAt.toDate().toLocaleString()}
          </p>
        )}
      </form>
    </div>
  );
}
