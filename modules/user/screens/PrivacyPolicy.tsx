import {ActivityIndicator, SafeAreaView, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import RenderHtml from 'react-native-render-html';

const PrivacyPolicy: React.FC = () => {
  const [htmlUrl, setHtmlUrl] = useState<any>(null);
  const SUPABASE_URL = 'https://gjbbbucnydedrqbydwou.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYmJidWNueWRlZHJxYnlkd291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1ODQ2MzQsImV4cCI6MjA1ODE2MDYzNH0.VIkbQTD_ZuO6YK_km3W7cCxqx2MZJhPAiUP27Cg48a8';

  const bucketName = 'sidekick';
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const getPrivacyPolicy = () => {
    const privatePolicy = 'legal/private_policy.html';
    const {data} = supabase.storage
      .from(bucketName)
      .getPublicUrl(privatePolicy);
    console.log('privatePolicy URL', data.publicUrl);
    return data.publicUrl;
  };

  useEffect(() => {
    setHtmlUrl(getPrivacyPolicy());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!htmlUrl) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
      <ScrollView
        contentContainerStyle={{paddingHorizontal: 10}}
        style={{marginTop: -40}}>
        <RenderHtml
          source={{uri: htmlUrl}}
          baseStyle={{
            margin: 0,
            padding: 0,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
