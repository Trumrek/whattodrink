/*
  # Ajout des champs Stripe aux abonnements

  1. Modifications
    - Ajout des champs pour Stripe
    - Ajout des contraintes et index nécessaires

  2. Sécurité
    - Maintien des politiques RLS existantes
*/

ALTER TABLE subscriptions
ADD COLUMN stripe_customer_id text UNIQUE,
ADD COLUMN stripe_subscription_id text UNIQUE,
ADD COLUMN stripe_price_id text,
ADD COLUMN stripe_current_period_end timestamptz;