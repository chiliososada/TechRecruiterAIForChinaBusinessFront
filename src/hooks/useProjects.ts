
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  title: string;
  client_company?: string;
  partner_company?: string;
  manager_name?: string;
  manager_email?: string;
  skills: string[];
  experience?: string;
  location?: string;
  budget?: string;
  desired_budget?: string;
  work_type?: string;
  duration?: string;
  start_date?: string;
  japanese_level?: string;
  status?: string;
  priority?: string;
  foreigner_accepted?: boolean;
  freelancer_accepted?: boolean;
  processes: string[];
  interview_count?: string;
  description?: string;
  detail_description?: string;
  company_type: string;
  is_active?: boolean; // Added missing is_active property
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentTenant, user } = useAuth();

  // Fetch projects for current tenant
  const fetchProjects = async () => {
    if (!currentTenant?.id) {
      console.log("No current tenant, skipping fetch");
      return;
    }
    
    console.log("Fetching projects for tenant:", currentTenant.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Fetched projects from database:", data?.length || 0, "projects");
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "エラー",
        description: "案件の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new project
  const createProject = async (projectData: Omit<Project, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!currentTenant?.id || !user?.id) {
      toast({
        title: "エラー",
        description: "認証情報が不足しています",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          tenant_id: currentTenant.id,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "成功",
        description: "案件が正常に作成されました",
      });

      await fetchProjects(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "エラー",
        description: "案件の作成に失敗しました",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update project
  const updateProject = async (id: string, projectData: Partial<Project>) => {
    if (!currentTenant?.id) {
      console.error("No current tenant for update");
      return null;
    }

    console.log("Updating project in database:", id, projectData);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .eq('tenant_id', currentTenant.id) // Ensure tenant isolation
        .select()
        .single();

      if (error) throw error;

      console.log("Project updated successfully in database:", data);

      toast({
        title: "成功",
        description: "案件が正常に更新されました",
      });

      // Don't call fetchProjects here - let the calling component handle it
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "エラー",
        description: "案件の更新に失敗しました",
        variant: "destructive",
      });
      return null;
    }
  };

  // Archive project
  const archiveProject = async (id: string, archiveReason?: string) => {
    if (!currentTenant?.id || !user?.id) return false;

    try {
      // First get the project data
      const { data: projectData, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (fetchError) throw fetchError;

      // Insert into archives
      const { error: archiveError } = await supabase
        .from('project_archives')
        .insert([{
          original_project_id: id,
          project_data: projectData,
          archive_reason: archiveReason || '手動アーカイブ',
          archived_by: user.id,
          tenant_id: currentTenant.id,
        }]);

      if (archiveError) throw archiveError;

      // Mark project as inactive
      const { error: updateError } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', currentTenant.id);

      if (updateError) throw updateError;

      toast({
        title: "成功",
        description: "案件が正常にアーカイブされました",
      });

      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error archiving project:', error);
      toast({
        title: "エラー",
        description: "案件のアーカイブに失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete project permanently
  const deleteProject = async (id: string) => {
    if (!currentTenant?.id) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('tenant_id', currentTenant.id); // Ensure tenant isolation

      if (error) throw error;

      toast({
        title: "成功",
        description: "案件が正常に削除されました",
      });

      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "エラー",
        description: "案件の削除に失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (currentTenant?.id) {
      fetchProjects();
    }
  }, [currentTenant?.id]);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    archiveProject,
    deleteProject,
  };
};
