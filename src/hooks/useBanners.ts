import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Banner {
  id: string;
  position: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
}

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('banners')
        .select('id, position, image_url, link_url, active')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (data) setBanners(data);
    };

    fetchBanners();
  }, []);

  const getBannersByPosition = (position: string) =>
    banners.filter((b) => b.position === position);

  return { banners, getBannersByPosition };
};
