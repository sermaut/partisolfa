-- Add referral_code to profiles (unique code for each user)
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE,
ADD COLUMN referred_by UUID REFERENCES public.profiles(user_id);

-- Create index for referral lookups
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  bonus_awarded BOOLEAN NOT NULL DEFAULT false,
  bonus_amount_kz NUMERIC NOT NULL DEFAULT 300,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bonus_awarded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals as referrer"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own referrals as referred"
ON public.referrals
FOR SELECT
USING (auth.uid() = referred_id);

CREATE POLICY "Admins can manage all referrals"
ON public.referrals
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to set referral code on profile creation
CREATE OR REPLACE FUNCTION public.set_referral_code_on_profile()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := public.generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate referral code
CREATE TRIGGER trigger_set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_referral_code_on_profile();

-- Update existing profiles with referral codes
DO $$
DECLARE
  profile_record RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR profile_record IN SELECT user_id FROM public.profiles WHERE referral_code IS NULL LOOP
    LOOP
      new_code := public.generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE public.profiles SET referral_code = new_code WHERE user_id = profile_record.user_id;
  END LOOP;
END $$;

-- Function to award referral bonus when deposit is approved
CREATE OR REPLACE FUNCTION public.award_referral_bonus()
RETURNS TRIGGER AS $$
DECLARE
  referrer_user_id UUID;
  first_deposit_count INT;
  bonus_kz NUMERIC := 300;
  bonus_credits NUMERIC;
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Check if this is the user's first approved deposit
    SELECT COUNT(*) INTO first_deposit_count
    FROM public.deposits
    WHERE user_id = NEW.user_id 
      AND status = 'approved'
      AND id != NEW.id;
    
    -- If first deposit (no other approved deposits)
    IF first_deposit_count = 0 THEN
      -- Check if user was referred
      SELECT referred_by INTO referrer_user_id
      FROM public.profiles
      WHERE user_id = NEW.user_id;
      
      IF referrer_user_id IS NOT NULL THEN
        -- Check if bonus not yet awarded
        IF NOT EXISTS (
          SELECT 1 FROM public.referrals 
          WHERE referred_id = NEW.user_id AND bonus_awarded = true
        ) THEN
          -- Calculate credits from 300 Kz (1 credit = 150 Kz)
          bonus_credits := bonus_kz / 150.0;
          
          -- Add bonus to referrer's credits
          UPDATE public.profiles
          SET credits = credits + bonus_credits
          WHERE user_id = referrer_user_id;
          
          -- Mark referral bonus as awarded
          UPDATE public.referrals
          SET bonus_awarded = true, bonus_awarded_at = now()
          WHERE referrer_id = referrer_user_id AND referred_id = NEW.user_id;
          
          -- Create notification for referrer
          INSERT INTO public.notifications (user_id, title, message)
          VALUES (
            referrer_user_id,
            'Bónus de Convite!',
            'Parabéns! Recebeste um bónus de ' || bonus_credits || ' créditos (' || bonus_kz || ' Kz) porque o teu convidado completou o primeiro depósito.'
          );
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to award bonus on deposit approval
CREATE TRIGGER trigger_award_referral_bonus
AFTER UPDATE ON public.deposits
FOR EACH ROW
EXECUTE FUNCTION public.award_referral_bonus();