import React from 'react';
import { useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { TabsWithContext, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import components
import { CaseList } from '@/components/cases/list/CaseList';
import { CaseUploadTab } from '@/components/cases/tabs/CaseUploadTab';
import { EmailStatsTab } from '@/components/cases/tabs/EmailStatsTab';
import { EmailSenderContainer } from '@/components/cases/EmailSenderContainer';
import { CasesHeader } from '@/components/cases/CasesHeader';
import { CaseArchiveTab } from '@/components/cases/tabs/CaseArchiveTab';

// Import hooks
import { useProjects } from '@/hooks/useProjects';
import { useProjectArchives } from '@/hooks/useProjectArchives';
import { useCaseFilters } from '@/components/cases/hooks/useCaseFilters';
import { usePagination } from '@/components/cases/hooks/usePagination';
import { useCaseSelection } from '@/components/cases/hooks/useCaseSelection';

// Import utilities
import { 
  filterCases, 
  filterMailCases, 
  getPaginatedData, 
  calculateTotalPages,
  processEmailStats,
  getArchiveCandidates
} from '@/components/cases/utils/caseUtils';
import { getCompanyList } from '@/components/cases/data/caseData';
import { normalizeStatus } from '@/components/cases/utils/statusUtils';
import { useAuth } from '@/contexts/AuthContext';

interface CasesProps {
  companyType?: 'own' | 'other';
}

export function Cases({ companyType = 'own' }: CasesProps) {
  // Get auth context for subscription plan checking
  const { currentTenant } = useAuth();
  
  // Get projects from Supabase
  const { projects, loading: projectsLoading, fetchProjects } = useProjects();
  const { archives } = useProjectArchives();

  // Use custom hooks for state management
  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    techKeyword,
    setTechKeyword,
    dateRange,
    setDateRange,
    startDateFrom,
    setStartDateFrom,
    startDateTo,
    setStartDateTo,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    emailDateFrom,
    setEmailDateFrom,
    emailDateTo,
    setEmailDateTo,
    resetDateFilters
  } = useCaseFilters();

  // Add state for foreigner filter
  const [foreignerFilter, setForeignerFilter] = React.useState("all");

  const {
    currentPage,
    setCurrentPage,
    casesCurrentPage,
    setCasesCurrentPage,
    itemsPerPage
  } = usePagination();

  // Add state for sorting
  const [sortField, setSortField] = React.useState("start_date");
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const location = useLocation();
  
  // Company type from URL for backward compatibility
  const urlCompanyType = location.pathname.includes('/company/other') ? 'other' : 'own';
  const effectiveCompanyType = urlCompanyType || companyType;
  
  // Page title based on company type
  const pageTitle = effectiveCompanyType === 'own' ? '自社案件管理' : '他社案件管理';
  
  // Check if user has access to email statistics based on subscription plan
  const hasEmailStatsAccess = React.useMemo(() => {
    const subscriptionPlan = currentTenant?.subscription_plan?.toLowerCase();
    return subscriptionPlan !== 'basic' && subscriptionPlan !== 'free';
  }, [currentTenant?.subscription_plan]);
  
  // Convert Supabase projects to the format expected by existing components
  // Filter by company_type from database instead of using route logic
  const normalizedCaseData = React.useMemo(() => {
    const targetCompanyType = effectiveCompanyType === 'own' ? '自社' : '他社';
    
    console.log('=== DEBUG: Projects filtering ===');
    console.log('Total projects from DB:', projects.length);
    console.log('Target company type:', targetCompanyType);
    console.log('Effective company type:', effectiveCompanyType);
    console.log('ALL Projects data with company_type:', projects.map(p => ({ 
      id: p.id, 
      title: p.title, 
      company_type: p.company_type,
      is_active: p.is_active
    })));
    
    // 检查是否有null、undefined或其他意外值
    const companyTypes = projects.map(p => p.company_type);
    console.log('All company_type values:', companyTypes);
    console.log('Unique company_type values:', [...new Set(companyTypes)]);
    
    // Filter by company_type and ensure is_active = true
    const filteredByCompanyType = projects.filter(project => {
      const matchesCompanyType = project.company_type === targetCompanyType;
      const isActive = project.is_active === true; // Explicitly check for active projects
      const matches = matchesCompanyType && isActive;
      
      console.log(`Project "${project.title}":`, {
        company_type: project.company_type,
        expected: targetCompanyType,
        matchesCompanyType,
        is_active: project.is_active,
        isActive,
        finalMatch: matches
      });
      
      if (!matches) {
        console.log(`❌ Filtered out project "${project.title}" - company_type: "${project.company_type}" (expected: "${targetCompanyType}"), is_active: ${project.is_active}`);
      } else {
        console.log(`✅ Included project "${project.title}"`);
      }
      return matches;
    });
    
    console.log('After company_type and is_active filter:', filteredByCompanyType.length);
    
    const normalized = filteredByCompanyType.map(project => {
      console.log(`=== DEBUG: Raw project data for ${project.id} ===`);
      console.log('start_date field:', project.start_date);
      console.log('start_date type:', typeof project.start_date);
      
      return {
        id: project.id,
        title: project.title,
        company: project.client_company || '',
        manager: project.manager_name || '',
        managerEmail: project.manager_email || '',
        // Add sender fields for bulk email functionality
        sender: project.manager_name || '',
        senderName: project.manager_name || '',
        senderEmail: project.manager_email || '',
        skills: project.skills || [],
        experience: project.experience || '',
        location: project.location || '',
        workType: project.work_type || '',
        duration: project.duration || '',
        budget: project.budget || '',
        desiredBudget: project.desired_budget || '',
        japanese: project.japanese_level || '',
        priority: project.priority || '',
        status: normalizeStatus(project.status || ''),
        startDate: project.start_date || '',
        foreignerAccepted: project.foreigner_accepted || false,
        freelancerAccepted: project.freelancer_accepted || false,
        interviewCount: project.interview_count || '1',
        processes: project.processes || [],
        detailDescription: project.detail_description || '',
        description: project.description || '',
        createdAt: project.created_at || '',
        // Add registration info for bulk email display
        registrationType: project.source || '手動',
        registeredAt: project.created_at || '',
        // Use the actual database company_type field
        companyType: effectiveCompanyType
      };
    });
    
    console.log('Final normalized case data (first 3):', normalized.slice(0, 3).map(n => ({ 
      id: n.id, 
      title: n.title, 
      location: n.location,
      sender: n.sender,
      senderEmail: n.senderEmail,
      startDate: n.startDate
    })));
    
    return normalized;
  }, [projects, effectiveCompanyType]);

  const {
    selectedCase,
    setSelectedCase,
    editMode,
    setEditMode,
    editingCaseData,
    setEditingCaseData,
    toggleEditMode,
    handleEditChange,
    handleSaveEdit,
    localCaseData // 获取本地数据状态
  } = useCaseSelection(normalizedCaseData);
  
  // Get company list
  const companyList = getCompanyList();
  
  // Filtered cases for the list view - exclude archive candidates by default
  // 使用 localCaseData 作为数据源而不是 normalizedCaseData
  const filteredCases = React.useMemo(() => {
    console.log('=== DEBUG: Cases filtering ===');
    console.log('Before filterCases:', localCaseData.length);
    console.log('Local case data titles:', localCaseData.map(c => ({ id: c.id, title: c.title })));
    console.log('Status filter:', statusFilter);
    console.log('Search term:', searchTerm);
    console.log('Date range:', dateRange);
    console.log('Foreigner filter:', foreignerFilter);
    
    const result = filterCases(
      localCaseData, // 使用本地数据
      effectiveCompanyType,
      statusFilter,
      searchTerm,
      dateRange,
      foreignerFilter,
      true // excludeArchiveCandidates = true for normal list
    );
    
    console.log('After filterCases:', result.length);
    console.log('Filtered cases (first 3):', result.slice(0, 3).map(r => ({ 
      id: r.id, 
      title: r.title 
    })));
    
    if (result.length !== localCaseData.length) {
      console.log('Some cases were filtered out by filterCases function');
      // Log which cases were filtered out
      const filteredOutCases = localCaseData.filter(caseItem => 
        !result.some(resultCase => resultCase.id === caseItem.id)
      );
      console.log('Filtered out cases:', filteredOutCases.map(c => ({ id: c.id, title: c.title, status: c.status })));
    }
    
    return result;
  }, [
    localCaseData, // 依赖本地数据
    effectiveCompanyType,
    statusFilter,
    searchTerm,
    dateRange,
    foreignerFilter
  ]);

  // Get active archive candidates for the archive tab - use ONLY ACTIVE normalizedCaseData
  const archiveCandidates = React.useMemo(() => {
    console.log('=== DEBUG: Getting archive candidates from ACTIVE projects ===');
    console.log('All normalized case data (active only):', normalizedCaseData.length);
    console.log('Sample case data for debugging:', normalizedCaseData.slice(0, 2));
    
    const candidates = getArchiveCandidates(normalizedCaseData);
    console.log('Archive candidates found from active projects:', candidates.length);
    console.log('Archive candidates details:', candidates.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      startDate: c.startDate
    })));
    
    return candidates;
  }, [normalizedCaseData]);

  // Handle sorting
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Apply sorting to the filtered cases
  const sortedCases = React.useMemo(() => {
    console.log('=== DEBUG: Sorting cases ===');
    console.log('Sort field:', sortField, 'Sort direction:', sortDirection);
    console.log('Filtered cases before sorting (titles):', filteredCases.map(c => ({ id: c.id, title: c.title })));
    
    if (sortField !== "start_date") {
      console.log('No sorting applied, returning filtered cases as is');
      return filteredCases;
    }
    
    const sorted = [...filteredCases].sort((a, b) => {
      const dateA = a.startDate || '';
      const dateB = b.startDate || '';
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      const comparison = dateA.localeCompare(dateB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    console.log('Sorted cases (titles):', sorted.map(c => ({ id: c.id, title: c.title })));
    return sorted;
  }, [filteredCases, sortField, sortDirection]);

  const totalCasesPages = calculateTotalPages(filteredCases.length, itemsPerPage);

  // Paginated cases for the list view
  const paginatedCases = React.useMemo(() => {
    console.log('=== DEBUG: Creating paginated cases ===');
    console.log('Sorted cases input (titles):', sortedCases.map(c => ({ id: c.id, title: c.title })));
    console.log('Current page:', casesCurrentPage, 'Items per page:', itemsPerPage);
    
    const paginated = getPaginatedData(sortedCases, casesCurrentPage, itemsPerPage);
    
    console.log('Paginated cases output (titles):', paginated.map(c => ({ id: c.id, title: c.title })));
    return paginated;
  }, [sortedCases, casesCurrentPage, itemsPerPage]);
  
  // Debug log for paginated cases to see what's being passed to CaseList
  React.useEffect(() => {
    console.log('=== DEBUG: Paginated cases for CaseList ===');
    console.log('Paginated cases length:', paginatedCases.length);
    console.log('Paginated cases (titles):', paginatedCases.map(c => ({ id: c.id, title: c.title })));
  }, [paginatedCases]);
  
  // For email sender and stats - use the same filteredCases as the main source of truth
  // but apply additional email-specific filters
  const filteredMailCases = React.useMemo(() => {
    return filterMailCases(
      filteredCases, // Use already filtered cases as the base
      effectiveCompanyType,
      companyFilter,
      techKeyword,
      emailDateFrom,
      emailDateTo
    );
  }, [
    filteredCases, 
    effectiveCompanyType, 
    companyFilter, 
    techKeyword, 
    emailDateFrom, 
    emailDateTo
  ]);
  
  // Email stats for visualization
  const emailStats = processEmailStats(filteredMailCases);

  // Get all unique start dates for filtering
  const uniqueStartDates = React.useMemo(() => {
    const dates = new Set<string>();
    filteredCases.forEach(item => {
      if (item.startDate) {
        dates.add(item.startDate);
      }
    });
    return Array.from(dates).sort();
  }, [filteredCases]);

  if (projectsLoading) {
    return (
      <MainLayout>
        <div className="flex-1 space-y-8 p-8 pt-6">
          <div className="text-center">案件データを読み込んでいます...</div>
        </div>
      </MainLayout>
    );
  }

  // Add callback function to refresh data after archive operation
  const handleArchiveSuccess = async () => {
    console.log('Archive operation completed, refreshing data...');
    await fetchProjects(); // Refresh the projects data
  };

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-8 pt-6">
        <CasesHeader pageTitle={pageTitle} />

        <TabsWithContext defaultValue="list" contextId={effectiveCompanyType} className="space-y-6">
          {/* For own company, show all tabs including the new archive tab */}
          {effectiveCompanyType === 'own' ? (
            <TabsList>
              <TabsTrigger contextId={effectiveCompanyType} value="list" className="japanese-text">案件一覧</TabsTrigger>
              <TabsTrigger contextId={effectiveCompanyType} value="upload" className="japanese-text">案件アップロード</TabsTrigger>
              <TabsTrigger contextId={effectiveCompanyType} value="archive" className="japanese-text">案件アーカイブ</TabsTrigger>
            </TabsList>
          ) : (
            /* For other company, show all tabs including email tabs */
            <TabsList>
              <TabsTrigger contextId={effectiveCompanyType} value="list" className="japanese-text">案件一覧</TabsTrigger>
              <TabsTrigger contextId={effectiveCompanyType} value="upload" className="japanese-text">案件アップロード</TabsTrigger>
              <TabsTrigger contextId={effectiveCompanyType} value="archive" className="japanese-text">案件アーカイブ</TabsTrigger>
              {hasEmailStatsAccess && (
                <TabsTrigger contextId={effectiveCompanyType} value="stats" className="japanese-text">メール案件統計</TabsTrigger>
              )}
              <TabsTrigger contextId={effectiveCompanyType} value="send" className="japanese-text">一括送信</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent contextId={effectiveCompanyType} value="list" className="space-y-6">
            <CaseList 
              filteredCases={paginatedCases}
              selectedCase={selectedCase}
              setSelectedCase={setSelectedCase}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              foreignerFilter={foreignerFilter}
              setForeignerFilter={setForeignerFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              resetDateFilters={resetDateFilters}
              casesCurrentPage={casesCurrentPage}
              setCasesCurrentPage={setCasesCurrentPage}
              totalCasesPages={totalCasesPages}
              editMode={editMode}
              setEditMode={setEditMode}
              editingCaseData={editingCaseData}
              setEditingCaseData={setEditingCaseData}
              handleEditChange={handleEditChange}
              handleSaveEdit={handleSaveEdit}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </TabsContent>
          
          <TabsContent contextId={effectiveCompanyType} value="upload" className="space-y-6">
            <CaseUploadTab />
          </TabsContent>

          {/* Archive Tab using ONLY ACTIVE archive candidates */}
          <TabsContent contextId={effectiveCompanyType} value="archive" className="space-y-6">
            <CaseArchiveTab 
              cases={archiveCandidates} 
              companyType={effectiveCompanyType}
              onArchiveSuccess={handleArchiveSuccess}
            />
          </TabsContent>
          
          {/* Only show the stats and send tabs for other company */}
          {effectiveCompanyType === 'other' && (
            <>
              {hasEmailStatsAccess && (
                <TabsContent contextId={effectiveCompanyType} value="stats" className="space-y-6">
                <EmailStatsTab 
                  filteredMailCases={filteredMailCases}
                  paginatedMailCases={getPaginatedData(filteredMailCases, currentPage, itemsPerPage)}
                  companyFilter={companyFilter}
                  setCompanyFilter={setCompanyFilter}
                  techKeyword={techKeyword}
                  setTechKeyword={setTechKeyword}
                  emailDateFrom={emailDateFrom}
                  setEmailDateFrom={setEmailDateFrom}
                  emailDateTo={emailDateTo}
                  setEmailDateTo={setEmailDateTo}
                  resetDateFilters={resetDateFilters}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={calculateTotalPages(filteredMailCases.length, itemsPerPage)}
                  emailStats={emailStats}
                  companyList={companyList}
                />
                </TabsContent>
              )}

              <TabsContent contextId={effectiveCompanyType} value="send" className="space-y-6">
                <EmailSenderContainer 
                  mailCases={filteredCases} // Pass the same filtered cases as the source of truth
                />
              </TabsContent>
            </>
          )}
        </TabsWithContext>
      </div>
    </MainLayout>
  );
}

export default Cases;
