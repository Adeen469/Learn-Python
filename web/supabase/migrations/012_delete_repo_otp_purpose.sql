-- 012: allow 'delete-repo' OTPs. The delete-repo email code (ca20fb5) could
-- never send live: storeOtp's insert violated the 004 CHECK on
-- lp_auth_otp.purpose ('signup','signin','2fa'), so issueOtpCode failed
-- and the dialog showed "Could not send the email". Postgres names an
-- inline column CHECK <table>_<column>_check.
alter table public.lp_auth_otp drop constraint if exists lp_auth_otp_purpose_check;
alter table public.lp_auth_otp add constraint lp_auth_otp_purpose_check check (purpose in ('signup', 'signin', '2fa', 'delete-repo'));
