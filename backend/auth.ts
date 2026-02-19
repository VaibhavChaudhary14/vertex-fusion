
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { User as DbUser } from "@shared/schema";

// Extend Express User type
declare global {
    namespace Express {
        interface User extends DbUser { }
    }
}

export function setupAuth(app: Express) {
    const MemoryStore = createMemoryStore(session);
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "randon_secret_key_123",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
        },
        store: new MemoryStore({
            checkPeriod: 86400000,
        }),
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    // Local Strategy
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const user = await storage.getUser(email);
                    if (!user || !user.passwordHash) {
                        return done(null, false, { message: "Invalid credentials" });
                    }

                    // if (!user.isEmailVerified) {
                    //     return done(null, false, { message: "Email not verified" });
                    // }

                    const isValid = await bcrypt.compare(password, user.passwordHash);
                    if (!isValid) {
                        return done(null, false, { message: "Invalid credentials" });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            },
        ),
    );

    // Google Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: "/api/auth/google/callback",
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email = profile.emails?.[0].value;
                        if (!email) return done(new Error("No email found in Google profile"));

                        let user = await storage.getUser(email);

                        if (!user) {
                            user = await storage.upsertUser({
                                id: email, // Use email as ID for Google users too, or generate UUID
                                email,
                                firstName: profile.name?.givenName,
                                lastName: profile.name?.familyName,
                                profileImageUrl: profile.photos?.[0].value,
                                isEmailVerified: true, // Google emails are verified
                            });
                        }
                        return done(null, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    }

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Google Auth Routes
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/login" }),
        (req, res) => {
            res.redirect("/dashboard");
        }
    );
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}
