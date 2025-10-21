import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase.config';
import type { PodcastEpisode, PodcastFormData } from '@shared/types';

const INITIAL_FORM_DATA: PodcastFormData = {
  title: '',
  description: '',
  episodeNumber: 1,
  season: 1,
  publishDate: null,
  duration: '',
  audioUrl: '',
  spotifyUrl: '',
  appleUrl: '',
  youtubeUrl: '',
  guestName: '',
  thumbnailUrl: '',
  featured: false,
};

export default function Podcast() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<PodcastEpisode | null>(null);
  const [formData, setFormData] = useState<PodcastFormData>(INITIAL_FORM_DATA);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      const episodesRef = collection(db, 'podcastEpisodes');
      const q = query(episodesRef, orderBy('publishDate', 'desc'));
      const snapshot = await getDocs(q);
      const episodesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PodcastEpisode[];
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error loading episodes:', error);
      alert('Failed to load episodes');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'date') {
      setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : null }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.thumbnailUrl;

    setUploadingImage(true);
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `podcast/${timestamp}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const thumbnailUrl = await uploadImage();

      const episodeData = {
        ...formData,
        publishDate: formData.publishDate ? Timestamp.fromDate(formData.publishDate) : Timestamp.now(),
        thumbnailUrl,
        createdAt: editingEpisode?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (editingEpisode) {
        await updateDoc(doc(db, 'podcastEpisodes', editingEpisode.id), episodeData);
        alert('✅ Episode updated successfully!');
      } else {
        await addDoc(collection(db, 'podcastEpisodes'), episodeData);
        alert('✅ Episode created successfully!');
      }

      setFormData(INITIAL_FORM_DATA);
      setEditingEpisode(null);
      setShowForm(false);
      setImageFile(null);
      loadEpisodes();
    } catch (error) {
      console.error('Error saving episode:', error);
      alert('❌ Failed to save episode: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (episode: PodcastEpisode) => {
    setEditingEpisode(episode);
    setFormData({
      title: episode.title,
      description: episode.description,
      episodeNumber: episode.episodeNumber,
      season: episode.season || 1,
      publishDate: episode.publishDate.toDate(),
      duration: episode.duration || '',
      audioUrl: episode.audioUrl || '',
      spotifyUrl: episode.spotifyUrl || '',
      appleUrl: episode.appleUrl || '',
      youtubeUrl: episode.youtubeUrl || '',
      guestName: episode.guestName || '',
      thumbnailUrl: episode.thumbnailUrl || '',
      featured: episode.featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (episodeId: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) return;

    try {
      await deleteDoc(doc(db, 'podcastEpisodes', episodeId));
      alert('✅ Episode deleted successfully!');
      loadEpisodes();
    } catch (error) {
      console.error('Error deleting episode:', error);
      alert('❌ Failed to delete episode');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#654321' }}>Podcast Episodes</h1>
          <p style={{ margin: 0, color: '#8B4513', fontSize: '14px' }}>
            Manage podcast episodes displayed on your website
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingEpisode(null);
            setFormData(INITIAL_FORM_DATA);
            setImageFile(null);
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: showForm ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Episode'}
        </button>
      </div>

      {/* Episode Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px',
        }}>
          <h2 style={{ marginTop: 0, color: '#654321' }}>
            {editingEpisode ? 'Edit Episode' : 'Create New Episode'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Episode Title *
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
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
                  Episode Number *
                  <input
                    type="number"
                    name="episodeNumber"
                    value={formData.episodeNumber}
                    onChange={handleInputChange}
                    required
                    min="1"
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
                  Season
                  <input
                    type="number"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    min="1"
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
                  Publish Date *
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate ? formData.publishDate.toISOString().split('T')[0] : ''}
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
                  Duration (e.g., "45:30")
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="45:30"
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

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Description *
                  <textarea
                    name="description"
                    value={formData.description}
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

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Guest Name
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    placeholder="e.g., John Smith"
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
                  Audio File URL
                  <input
                    type="url"
                    name="audioUrl"
                    value={formData.audioUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
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
                  Spotify URL
                  <input
                    type="url"
                    name="spotifyUrl"
                    value={formData.spotifyUrl}
                    onChange={handleInputChange}
                    placeholder="https://open.spotify.com/..."
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
                  Apple Podcasts URL
                  <input
                    type="url"
                    name="appleUrl"
                    value={formData.appleUrl}
                    onChange={handleInputChange}
                    placeholder="https://podcasts.apple.com/..."
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
                  YouTube URL
                  <input
                    type="url"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/..."
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

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#654321' }}>
                  Thumbnail Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  {formData.thumbnailUrl && !imageFile && (
                    <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Current image: <a href={formData.thumbnailUrl} target="_blank" rel="noopener noreferrer">View</a>
                    </p>
                  )}
                </label>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: '#654321' }}>Featured Episode</span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                style={{
                  padding: '12px 32px',
                  backgroundColor: loading || uploadingImage ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || uploadingImage ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                }}
              >
                {loading ? 'Saving...' : uploadingImage ? 'Uploading Image...' : editingEpisode ? 'Update Episode' : 'Create Episode'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEpisode(null);
                  setFormData(INITIAL_FORM_DATA);
                  setImageFile(null);
                }}
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
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Episodes List */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginTop: 0, color: '#654321', marginBottom: '20px' }}>
          All Episodes ({episodes.length})
        </h2>

        {episodes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8B4513', padding: '40px' }}>
            No episodes yet. Create your first episode above!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Episode</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Guest</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#654321' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Duration</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#654321' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map((episode) => (
                  <tr key={episode.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        Episode {episode.episodeNumber}{episode.season ? ` (S${episode.season})` : ''}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        {episode.title}
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {episode.guestName || '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {formatDate(episode.publishDate)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                      {episode.duration || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {episode.featured && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: '#FFF3E0',
                          color: '#E65100',
                        }}>
                          ⭐ Featured
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(episode)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(episode.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
