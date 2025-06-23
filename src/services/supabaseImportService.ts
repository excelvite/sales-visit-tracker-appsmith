
import { supabase } from "@/integrations/supabase/client";
import { StoreCategory } from "@/types";

export interface ComprehensiveImportData {
  name: string;
  category: StoreCategory;
  region: string;
  area: string;
  state: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  picInfo: string;
  salesperson: string;
  latestUpdate: string;
  nextSteps: string;
  visitStatus: string[];
  potentialLevel: string;
}

export const importComprehensiveData = async (data: ComprehensiveImportData[]) => {
  const results = [];
  
  for (const item of data) {
    try {
      // Call the database function to handle the import
      const { data: result, error } = await supabase.rpc('import_store_with_update', {
        store_name: item.name,
        store_category: item.category,
        store_region: item.region,
        store_area: item.area,
        store_state: item.state,
        store_address: item.address,
        store_city: item.city,
        store_phone: item.phone,
        store_email: item.email,
        store_pic_info: item.picInfo,
        store_salesperson: item.salesperson,
        latest_update: item.latestUpdate,
        next_steps: item.nextSteps,
        visit_status: item.visitStatus,
        potential_level: item.potentialLevel
      });

      if (error) {
        console.error('Error importing item:', item.name, error);
        results.push({ item: item.name, success: false, error: error.message });
      } else {
        results.push({ item: item.name, success: true, storeId: result });
      }
    } catch (error) {
      console.error('Exception importing item:', item.name, error);
      results.push({ item: item.name, success: false, error: String(error) });
    }
  }
  
  return results;
};

export const getStoresFromSupabase = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
  
  return data || [];
};

export const getStoreUpdatesFromSupabase = async (storeId?: string) => {
  let query = supabase
    .from('store_updates')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (storeId) {
    query = query.eq('store_id', storeId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching store updates:', error);
    return [];
  }
  
  return data || [];
};
