// dependencies
import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gjbbbucnydedrqbydwou.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYmJidWNueWRlZHJxYnlkd291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1ODQ2MzQsImV4cCI6MjA1ODE2MDYzNH0.VIkbQTD_ZuO6YK_km3W7cCxqx2MZJhPAiUP27Cg48a8';

const privacyPolicy =
  'https://gjbbbucnydedrqbydwou.supabase.co/storage/v1/object/sign/sidekick/Privacy%20Policy_sidekick-converted.html?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzaWRla2ljay9Qcml2YWN5IFBvbGljeV9zaWRla2ljay1jb252ZXJ0ZWQuaHRtbCIsImlhdCI6MTc0MzUxOTE0MSwiZXhwIjo0ODk3MTE5MTQxfQ.nwQGWXeOOKIwx0koX2qGSJet9NmnSsLyDdFw-FqWSeM';

// const tnc =
//   'https://gjbbbucnydedrqbydwou.supabase.co/storage/v1/object/sign/sidekick/T&C_sidekick.html?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJzaWRla2ljay9UJkNfc2lkZWtpY2suaHRtbCIsImlhdCI6MTc0MzUxOTUwNiwiZXhwIjo0ODk3MTE5NTA2fQ.kDSUiPf1lF-4NGbqefeidFsc73kekGQ0sBbXOBt5lag';

const tnc = 'T&C_sidekick';

const bucketName = 'sidekick';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getPrivacyPolicy = () => {
  const {data} = supabase.storage.from(bucketName).getPublicUrl(privacyPolicy);
  return data.publicUrl;
};

export const getTNC = () => {
  const {data} = supabase.storage.from(bucketName).getPublicUrl(tnc);
  console.log('tnc URL', data.publicUrl);
  return data.publicUrl;
};
