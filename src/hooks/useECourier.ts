import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ECourierOrder {
  recipient_name: string;
  recipient_mobile: string;
  recipient_city: string;
  recipient_area: string;
  recipient_address: string;
  cod_amount: number;
  parcel_weight?: number;
  merchant_invoice_id?: string;
  special_instruction?: string;
}

export function useECourier() {
  const [loading, setLoading] = useState(false);

  const callECourier = async (action: string, payload: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ecourier-courier', {
        body: { action, ...payload },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (error: any) {
      console.error('eCourier API error:', error);
      toast.error(`eCourier API error: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    return await callECourier('test_connection');
  };

  const getDistricts = async () => {
    const result = await callECourier('get_districts');
    return result?.data || result || [];
  };

  const getThanas = async (district_id: string) => {
    const result = await callECourier('get_thanas', { district_id });
    return result?.data || result || [];
  };

  const getAreas = async (thana_id: string) => {
    const result = await callECourier('get_areas', { thana_id });
    return result?.data || result || [];
  };

  const createOrder = async (order: ECourierOrder) => {
    const result = await callECourier('create_order', { order });
    if (result?.tracking_code || result?.data?.tracking_code) {
      toast.success('eCourier order created successfully');
    }
    return result;
  };

  const trackOrder = async (tracking_code: string) => {
    return await callECourier('track_order', { tracking_code });
  };

  const cancelOrder = async (tracking_code: string) => {
    const result = await callECourier('cancel_order', { tracking_code });
    toast.success('Order cancelled');
    return result;
  };

  return {
    loading,
    testConnection,
    getDistricts,
    getThanas,
    getAreas,
    createOrder,
    trackOrder,
    cancelOrder,
  };
}
