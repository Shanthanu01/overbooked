# 🎟️ Overbooked – Event Booking System

Overbooked is a **full-stack MERN application** designed to make event booking simple, interactive, and AI-powered.  
Admins can create and manage events, while customers can browse, filter, and book tickets seamlessly.  

---

## 🚀 Features

### 🎫 Event Management
- Admin can **add, update, and delete events**
- Customers can **view all events** with details
- Search & filter events based on **location, price, and category**

### 💡 Smart Enhancements
- **AI-powered chatbot (Rasa)** for customer assistance  
- **Recommendation system** for suggesting similar events (using Sentence Transformers & Flask API)  
- **Hate speech detection** in the comments section (Hugging Face API)  
- **Dynamic ticket pricing** based on demand

### 🖼️ UI/UX
- Event details page with background image and booking counter
- Stand-wise ticket booking with availability tracking
- "Sold Out" indicator when tickets are unavailable
- Google Map integration for event locations
- Chatbot button **"Ask Walter"** for instant help

---

## 🛠️ Tech Stack

**Frontend:** React, TailwindCSS, shadcn/ui, Framer Motion  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Atlas)  
**AI/ML:** Sentence Transformers, Hugging Face API, Rasa Chatbot  
**Other:** Git, REST APIs, Flask (for recommendation system)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Shanthanu01/overbooked.git
cd overbooked
