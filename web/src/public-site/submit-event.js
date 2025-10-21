// Submit Event Form Handler
import { db, storage } from './firebase.config.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('submitEventForm');
    const fileInput = document.getElementById('fileUpload');
    const fileNameDisplay = document.getElementById('fileName');

    // File upload handling
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDisplay.textContent = `Selected: ${file.name}`;
                fileNameDisplay.style.display = 'block';
            } else {
                fileNameDisplay.textContent = '';
                fileNameDisplay.style.display = 'none';
            }
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const messageElement = form.querySelector('.form-message');
            const btnText = form.querySelector('.btn-text');
            const btnLoading = form.querySelector('.btn-loading');
            const submitButton = form.querySelector('button[type="submit"]');

            // Get form data
            const formData = new FormData(form);
            const eventData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                companyName: formData.get('companyName'),
                eventDescription: formData.get('eventDescription'),
                eventDate: formData.get('eventDate'),
                eventTime: formData.get('eventTime'),
                websiteUrl: formData.get('websiteUrl'),
                submittedAt: new Date().toISOString()
            };

            // Validate required fields
            if (!eventData.firstName || !eventData.lastName || !eventData.email ||
                !eventData.companyName || !eventData.eventDescription ||
                !eventData.eventDate || !eventData.eventTime) {
                messageElement.textContent = 'Please fill in all required fields';
                messageElement.className = 'form-message error';
                return;
            }

            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
            submitButton.disabled = true;
            messageElement.textContent = '';
            messageElement.className = 'form-message';

            try {
                // Upload file if present
                let fileUrl = null;
                const file = formData.get('fileUpload');
                if (file && file.size > 0) {
                    const fileRef = ref(storage, `event-submissions/${Date.now()}_${file.name}`);
                    await uploadBytes(fileRef, file);
                    fileUrl = await getDownloadURL(fileRef);
                }

                // Prepare event data for Firestore
                const firestoreData = {
                    name: `${eventData.companyName} Event`,
                    description: eventData.eventDescription,
                    eventDate: Timestamp.fromDate(new Date(`${eventData.eventDate}T${eventData.eventTime}`)),
                    eventTime: eventData.eventTime,
                    address: eventData.companyName,
                    location: eventData.companyName,
                    websiteUrl: eventData.websiteUrl || '',
                    submittedBy: {
                        firstName: eventData.firstName,
                        lastName: eventData.lastName,
                        email: eventData.email
                    },
                    imageUrl: fileUrl,
                    status: 'pending', // Events need admin approval
                    eventType: 'local', // Mark as local event
                    createdAt: Timestamp.now(),
                    approved: false
                };

                // Save to Firestore
                const docRef = await addDoc(collection(db, 'events'), firestoreData);

                // Success!
                messageElement.textContent = 'Event submitted successfully! We\'ll review it and get back to you within 24-48 hours.';
                messageElement.className = 'form-message success';

                // Reset form
                form.reset();
                fileNameDisplay.textContent = '';
                fileNameDisplay.style.display = 'none';

                // Reset button after 5 seconds
                setTimeout(() => {
                    btnText.style.display = 'inline-block';
                    btnLoading.style.display = 'none';
                    submitButton.disabled = false;
                    messageElement.textContent = '';
                }, 5000);

            } catch (error) {
                console.error('Error submitting event:', error);
                messageElement.textContent = 'Oops! Something went wrong. Please try again or contact us directly.';
                messageElement.className = 'form-message error';

                // Reset button
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
                submitButton.disabled = false;
            }
        });
    }
});
