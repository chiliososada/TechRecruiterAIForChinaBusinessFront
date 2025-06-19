
import { toast } from 'sonner';
import { MailCase } from '../../types';

// Helper to count the total flattened senders in paginated cases
const countTotalFlattenedSenders = (paginatedCases: MailCase[]): number => {
  let totalCount = 0;
  
  paginatedCases.forEach(caseItem => {
    if (caseItem.senders && Array.isArray(caseItem.senders)) {
      totalCount += caseItem.senders.length;
    } else {
      totalCount += 1;
    }
  });
  
  return totalCount;
};

// Handle select all functionality
export const handleSelectAll = (
  paginatedCases: MailCase[],
  isSelectAll: boolean,
  setSelectedCases: (cases: MailCase[]) => void,
  setSelectAll: (value: boolean) => void
) => {
  if (isSelectAll) {
    // Deselect all
    setSelectedCases([]);
    setSelectAll(false);
    toast("全ての送信者の選択を解除しました");
  } else {
    // Get all flattened senders from the cases
    const flattenedSenders: any[] = [];
    
    // Process each case to extract all senders with proper rowIds
    paginatedCases.forEach(caseItem => {
      // Check if the case has senders array
      if (caseItem.senders && Array.isArray(caseItem.senders) && caseItem.senders.length > 0) {
        // Add each sender as a separate selection with the correct rowId
        caseItem.senders.forEach((sender, index) => {
          const senderEmail = sender.email || `${sender.name?.replace(/\s+/g, '').toLowerCase()}@example.com`;
          const rowId = `${caseItem.id}-${senderEmail}-${index}`;
          
          flattenedSenders.push({
            ...caseItem,
            selectedRowId: rowId,
            selectedSenderName: sender.name,
            selectedSenderEmail: sender.email,
            selectedSenderPosition: sender.position
          });
        });
      } else {
        // Fallback for cases without senders array
        const rowId = `${caseItem.id}-${caseItem.senderEmail || 'default'}-0`;
        flattenedSenders.push({
          ...caseItem,
          selectedRowId: rowId,
          selectedSenderName: caseItem.sender || caseItem.senderName || '',
          selectedSenderEmail: caseItem.senderEmail || '',
          selectedSenderPosition: ''
        });
      }
    });
    
    setSelectedCases(flattenedSenders);
    setSelectAll(true);
    
    const totalSenders = countTotalFlattenedSenders(paginatedCases);
    toast(`${totalSenders}名の送信者を選択しました`);
  }
};

// Handle individual case selection
export const handleSelectCase = (
  id: string,
  rowId: string,
  selectedCases: MailCase[],
  paginatedCases: MailCase[],
  setSelectedCases: (cases: MailCase[]) => void,
  setSelectAll: (value: boolean) => void
) => {
  // Find the case to toggle
  const caseToToggle = paginatedCases.find(c => c.id === id);
  if (!caseToToggle) return;
  
  // Check if this case is already selected with this specific rowId
  const isAlreadySelected = selectedCases.some(c => 
    c.id === id && c.selectedRowId === rowId
  );
  
  // Parse sender information from rowId
  const rowParts = rowId.split('-');
  const senderEmail = rowParts[1];
  const senderIndex = parseInt(rowParts[2]);
  
  if (isAlreadySelected) {
    // Remove from selected
    const updatedCases = selectedCases.filter(c => 
      !(c.id === id && c.selectedRowId === rowId)
    );
    setSelectedCases(updatedCases);
    setSelectAll(false);
    toast("送信者の選択を解除しました");
  } else {
    // Find the sender information based on rowId
    let selectedSenderName = '';
    let selectedSenderEmail = '';
    let selectedSenderPosition = '';
    
    // Try to extract sender information from the senders array if it exists
    if (caseToToggle.senders && Array.isArray(caseToToggle.senders) && senderIndex < caseToToggle.senders.length) {
      const sender = caseToToggle.senders[senderIndex];
      selectedSenderName = sender.name || '';
      selectedSenderEmail = sender.email || '';
      selectedSenderPosition = sender.position || '';
    } else {
      // Fallback to the case's sender information
      selectedSenderName = caseToToggle.sender || caseToToggle.senderName || '';
      selectedSenderEmail = caseToToggle.senderEmail || '';
    }
    
    // Add to selected, with sender details and rowId
    const updatedCase = { 
      ...caseToToggle,
      selectedRowId: rowId,
      selectedSenderName,
      selectedSenderEmail,
      selectedSenderPosition
    };
    
    setSelectedCases([...selectedCases, updatedCase]);
    toast("送信者を選択しました");
    
    // Get the total number of flattened senders in the paginated cases
    const totalFlattenedSenders = countTotalFlattenedSenders(paginatedCases);
    
    // Check if all senders are now selected
    if (selectedCases.length + 1 === totalFlattenedSenders) {
      setSelectAll(true);
    }
  }
};

// Create handlers for case selection actions
export const createCaseSelectionHandlers = ({ 
  setSelectedCases, 
  selectedCases, 
  selectAll, 
  setSelectAll 
}: {
  setSelectedCases: (cases: MailCase[]) => void;
  selectedCases: MailCase[];
  selectAll: boolean;
  setSelectAll: (value: boolean) => void;
}) => {
  return {
    handleSelectAll: (paginatedCases: MailCase[]) => 
      handleSelectAll(paginatedCases, selectAll, setSelectedCases, setSelectAll),
    
    handleSelectCase: (id: string, rowId: string, paginatedCases: MailCase[]) => 
      handleSelectCase(id, rowId, selectedCases, paginatedCases, setSelectedCases, setSelectAll)
  };
};
