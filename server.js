require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// In-memory Database (Sikhne ke liye - baad me SQLite/MongoDB se connect kar sakte hain)
let siteContent = "Yeh Meri Custom Website Ka Editable Content Hai!";

// Passport Google Setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Yahan user Google se authenticate hota hai
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user, content: siteContent });
});

// Google Login Route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Admin / Content Edit Route (Keval Logged-in Users Ke Liye)
app.post('/edit-content', (req, res) => {
    if (req.isAuthenticated()) {
        siteContent = req.body.newContent;
        res.redirect('/');
    } else {
        res.status(401).send("Aapko edit karne ke liye Google se login karna hoga.");
    }
});

// Logout Route
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server live hai: http://localhost:${process.env.PORT}`);
});

