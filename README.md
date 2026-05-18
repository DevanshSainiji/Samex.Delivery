# Samex.Delivery - Shipment Tracker

A time-boxed 30-minute mini-app for B2B shipment tracking.

## 🚀 How to Run

You need Node.js installed. Open two terminal windows.

**1. Start the Backend:**
```bash
cd server
npm install
npm start
```
*The API will run on http://localhost:5000*

**2. Start the Frontend:**
```bash
cd client
npm install
npm run dev
```
*The React app will open on http://localhost:5173*

## 🔮 What I'd do next with more time
1. **Move to MongoDB:** Replace the `shipments.json` filesystem store with a proper Mongoose schema and connection to MongoDB Atlas.
2. **Authentication:** Add a simple JWT-based hardcoded login gate (as mentioned in stretch goals) and wrap the API endpoints with a middleware to verify the token.
3. **Pagination & Real-time:** If the shipment list grows large, add server-side pagination. I would also add Socket.io or Server-Sent Events to push real-time status updates to the UI without refreshing.
4. **Stats Strip & Validation UI:** Add a visual dashboard strip at the top summarizing shipments by status count, and display inline error messages instead of standard browser alerts.

## 🤖 AI Usage Note
I utilized Claude 3.5 Sonnet / Opus via an IDE agent to accelerate the development under the 30-minute constraint. AI was incredibly helpful for rapidly scaffolding the Express boilerplate, generating realistic mock JSON seed data, and writing the repetitive React controlled form components. It didn't "fail," but I had to explicitly constrain it from over-engineering the solution (e.g., stopping it from adding complex Redux state or Tailwind configs). I verified the AI output by running the Express API endpoints via curl and testing the React frontend end-to-end to ensure the core UI flow correctly mapped to the JSON persistent storage.
