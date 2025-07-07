import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { businessClient } from '@/integrations/supabase/client';
import { sendIndividualEmail, getDefaultSMTPSettingId } from '@/utils/backend-api';
import { 
  downloadCSVTemplate, 
  downloadEmptyCSVTemplate, 
  parseCSV, 
  validateImportData,
  type BulkEmailContactCSV,
  type ValidationResult 
} from '@/utils/csvUtils';
import { BulkEmailContactRow, BulkEmailContactInsert, BulkEmailContactUpdate } from '@/integrations/supabase/business-types';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Send, 
  Users,
  Building,
  Filter,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  FileDown,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GroupedContact {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_position: string | null;
  group_id: string | null;
  group_name: string;
  group_color: string;
  notes: string | null;
  selected: boolean;
}

interface ContactGroup {
  group_name: string;
  group_color: string;
  contacts: GroupedContact[];
  selected: boolean;
}

interface CompanyGroup {
  company_name: string;
  contacts: GroupedContact[];
  selected: boolean;
}

const BulkEmail: React.FC = () => {
  const { currentTenant } = useAuth();
  const [contacts, setContacts] = useState<GroupedContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<GroupedContact | null>(null);
  
  // Import related state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewData, setImportPreviewData] = useState<BulkEmailContactCSV[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Email composition state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSignature, setEmailSignature] = useState('');
  
  // Collapse state for sections
  const [isGroupSectionCollapsed, setIsGroupSectionCollapsed] = useState(false);
  const [isCompanySectionCollapsed, setIsCompanySectionCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [collapsedCompanies, setCollapsedCompanies] = useState<Set<string>>(new Set());
  
  // Bulk send confirmation dialog state
  const [isBulkSendDialogOpen, setIsBulkSendDialogOpen] = useState(false);
  const [bulkSendData, setBulkSendData] = useState<{
    selectedContacts: GroupedContact[];
    confirmMessage: string;
  } | null>(null);

  // Form data for new/edit contact
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_position: '',
    group_name: 'デフォルトグループ',
    group_color: '#3B82F6',
    notes: ''
  });

  const groupColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  // Load contacts from database
  useEffect(() => {
    if (currentTenant?.id) {
      // Initialize business client authentication if available
      const authToken = localStorage.getItem('supabase.auth.token');
      if (authToken && businessClient) {
        businessClient.setAuth(authToken);
      }
      loadContacts();
    }
  }, [currentTenant?.id]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      
      if (!businessClient) {
        throw new Error('業務クライアントが利用できません');
      }
      
      const { data, error } = await businessClient.from('bulk_email_contacts')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .eq('is_active', true)
        .order('company_name')
        .order('contact_name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const contactsWithSelection = data.map(contact => ({
          ...contact,
          selected: false
        }));
        setContacts(contactsWithSelection);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "エラー",
        description: "会社データの読み込みに失敗しました。",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts based on search and group filter
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = filterGroup === 'all' || contact.group_name === filterGroup;
    
    return matchesSearch && matchesGroup;
  });

  // Group contacts by company
  const groupedByCompany = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.company_name]) {
      acc[contact.company_name] = {
        company_name: contact.company_name,
        contacts: [],
        selected: false
      };
    }
    acc[contact.company_name].contacts.push(contact);
    acc[contact.company_name].selected = acc[contact.company_name].contacts.every(c => selectedContacts.has(c.id));
    return acc;
  }, {} as { [key: string]: CompanyGroup });

  // Group contacts by group
  const groupedByGroup = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.group_name]) {
      acc[contact.group_name] = {
        group_name: contact.group_name,
        group_color: contact.group_color,
        contacts: [],
        selected: false
      };
    }
    acc[contact.group_name].contacts.push(contact);
    acc[contact.group_name].selected = acc[contact.group_name].contacts.every(c => selectedContacts.has(c.id));
    return acc;
  }, {} as { [key: string]: ContactGroup });

  // Get unique groups for filter
  const uniqueGroups = Array.from(new Set(contacts.map(c => c.group_name)));

  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  // Toggle company selection
  const toggleCompanySelection = (companyName: string) => {
    const company = groupedByCompany[companyName];
    const newSelected = new Set(selectedContacts);
    
    if (company.selected) {
      company.contacts.forEach(contact => newSelected.delete(contact.id));
    } else {
      company.contacts.forEach(contact => newSelected.add(contact.id));
    }
    
    setSelectedContacts(newSelected);
  };

  // Toggle group selection
  const toggleGroupSelection = (groupName: string) => {
    const group = groupedByGroup[groupName];
    const newSelected = new Set(selectedContacts);
    
    if (group.selected) {
      group.contacts.forEach(contact => newSelected.delete(contact.id));
    } else {
      group.contacts.forEach(contact => newSelected.add(contact.id));
    }
    
    setSelectedContacts(newSelected);
  };
  
  // Toggle group collapse
  const toggleGroupCollapse = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };
  
  // Toggle company collapse
  const toggleCompanyCollapse = (companyName: string) => {
    const newCollapsed = new Set(collapsedCompanies);
    if (newCollapsed.has(companyName)) {
      newCollapsed.delete(companyName);
    } else {
      newCollapsed.add(companyName);
    }
    setCollapsedCompanies(newCollapsed);
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTenant?.id) {
      toast({
        title: "エラー",
        description: "テナント情報が見つかりません。",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (editingContact) {
        // Update existing contact
        const updateData: BulkEmailContactUpdate = {
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_position: formData.contact_position || null,
          group_name: formData.group_name,
          group_color: formData.group_color,
          notes: formData.notes || null
        };

        if (!businessClient) {
          throw new Error('業務クライアントが利用できません');
        }
        
        const { error } = await businessClient.from('bulk_email_contacts')
          .update({
            company_name: updateData.company_name,
            contact_name: updateData.contact_name,
            contact_email: updateData.contact_email,
            contact_position: updateData.contact_position,
            group_name: updateData.group_name,
            group_color: updateData.group_color,
            notes: updateData.notes
          })
          .eq('id', editingContact.id)
          .eq('tenant_id', currentTenant.id);
        
        if (error) {
          throw error;
        }
      } else {
        // Create new contact
        const insertData: BulkEmailContactInsert = {
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_position: formData.contact_position || null,
          group_name: formData.group_name,
          group_color: formData.group_color,
          notes: formData.notes || null,
          tenant_id: currentTenant.id
        };

        if (!businessClient) {
          throw new Error('業務クライアントが利用できません');
        }
        
        const { error } = await businessClient.from('bulk_email_contacts')
          .insert({
            company_name: insertData.company_name,
            contact_name: insertData.contact_name,
            contact_email: insertData.contact_email,
            contact_position: insertData.contact_position,
            group_name: insertData.group_name,
            group_color: insertData.group_color,
            notes: insertData.notes,
            tenant_id: insertData.tenant_id
          });
        
        if (error) {
          throw error;
        }
      }

      toast({
        title: "成功",
        description: editingContact ? "会社情報を更新しました。" : "会社を追加しました。",
      });

      setIsContactDialogOpen(false);
      setEditingContact(null);
      setFormData({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_position: '',
        group_name: 'デフォルトグループ',
        group_color: '#3B82F6',
        notes: ''
      });
      
      await loadContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "エラー",
        description: "会社の保存に失敗しました。",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle contact deletion
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('この会社を削除しますか？')) return;
    
    try {
      setLoading(true);
      
      if (!businessClient) {
        throw new Error('業務クライアントが利用できません');
      }
      
      const { error } = await businessClient.from('bulk_email_contacts')
        .update({ is_active: false })
        .eq('id', contactId)
        .eq('tenant_id', currentTenant?.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "成功",
        description: "会社を削除しました。",
      });
      
      await loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "エラー",
        description: "会社の削除に失敗しました。",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  // Handle CSV file selection
  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "エラー",
        description: "CSVファイルを選択してください。",
        variant: "destructive"
      });
      return;
    }

    setImportFile(file);
    
    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      const validation = validateImportData(parsedData);
      
      setImportPreviewData(parsedData);
      setValidationResult(validation);
      
      if (validation.errors.length > 0) {
        toast({
          title: "検証エラー",
          description: `${validation.errors.length}件のエラーがあります。`,
          variant: "destructive"
        });
      } else if (validation.warnings.length > 0) {
        toast({
          title: "注意",
          description: `${validation.warnings.length}件の警告があります。`,
        });
      }
    } catch (error) {
      console.error('CSV parse error:', error);
      toast({
        title: "エラー",
        description: "CSVファイルの読み込みに失敗しました。",
        variant: "destructive"
      });
      setImportFile(null);
      setImportPreviewData([]);
      setValidationResult(null);
    }
  };

  // Handle CSV import execution
  const handleImportExecute = async () => {
    if (!validationResult || !currentTenant?.id) return;

    if (validationResult.validData.length === 0) {
      toast({
        title: "エラー",
        description: "インポートできるデータがありません。",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);

      if (!businessClient) {
        throw new Error('業務クライアントが利用できません');
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const contact of validationResult.validData) {
        try {
          const { error } = await businessClient.from('bulk_email_contacts')
            .insert({
              company_name: contact.company_name,
              contact_name: contact.contact_name,
              contact_email: contact.contact_email,
              contact_position: contact.contact_position || null,
              group_name: contact.group_name || 'デフォルトグループ',
              group_color: contact.group_color || '#3B82F6',
              notes: contact.notes || null,
              tenant_id: currentTenant.id,
              is_active: true
            });

          if (error) {
            errorCount++;
            errors.push(`${contact.contact_name}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          errorCount++;
          errors.push(`${contact.contact_name}: ${error instanceof Error ? error.message : '不明なエラー'}`);
        }
      }

      // Show results
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "インポート完了",
          description: `${successCount}件のデータを正常にインポートしました。`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "部分的成功",
          description: `${successCount}件成功、${errorCount}件失敗しました。`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "インポート失敗",
          description: `全てのデータのインポートに失敗しました。`,
          variant: "destructive"
        });
      }

      // Log errors for debugging
      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }

      // Refresh contact list and close dialog
      if (successCount > 0) {
        await loadContacts();
        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportPreviewData([]);
        setValidationResult(null);
      }

    } catch (error) {
      console.error('Import execution error:', error);
      toast({
        title: "エラー",
        description: "インポート処理中にエラーが発生しました。",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Reset import dialog
  const resetImportDialog = () => {
    setImportFile(null);
    setImportPreviewData([]);
    setValidationResult(null);
    setIsImporting(false);
  };

  // Replace variables in email content
  const replaceVariables = (content: string, contact: GroupedContact) => {
    return content
      .replace(/\{\{company_name\}\}/g, contact.company_name)
      .replace(/\{\{contact_name\}\}/g, contact.contact_name)
      .replace(/\{\{contact_position\}\}/g, contact.contact_position || '');
  };

  // Handle bulk email send
  const handleBulkSend = async () => {
    if (selectedContacts.size === 0) {
      toast({
        title: "エラー",
        description: "送信先を選択してください。",
        variant: "destructive"
      });
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "エラー",
        description: "件名と本文を入力してください。",
        variant: "destructive"
      });
      return;
    }

    // Check if SMTP settings are configured
    const smtpSettingId = await getDefaultSMTPSettingId({ tenant_id: currentTenant?.id || '' });
    if (!smtpSettingId) {
      toast({
        title: "エラー",
        description: "SMTP設定が見つかりません。先に設定画面でSMTP設定を保存してください。",
        variant: "destructive"
      });
      return;
    }

    if (!currentTenant?.id) {
      toast({
        title: "エラー",
        description: "テナント情報が見つかりません。",
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog for bulk send
    const selectedContactsList = contacts.filter(c => selectedContacts.has(c.id));
    const confirmMessage = `${selectedContactsList.length}名の会社にメールを送信しますか？`;
    
    setBulkSendData({
      selectedContacts: selectedContactsList,
      confirmMessage
    });
    setIsBulkSendDialogOpen(true);
  };

  // Handle confirmed bulk send
  const handleConfirmedBulkSend = async () => {
    if (!bulkSendData || !currentTenant?.id) {
      return;
    }

    setIsBulkSendDialogOpen(false);

    try {
      setLoading(true);
      
      // Add progress feedback
      toast({
        title: "送信中",
        description: `${bulkSendData.selectedContacts.length}件のメールを送信しています...`,
      });
      
      // Prepare email data for each contact with variable replacement
      const emailPromises = bulkSendData.selectedContacts.map(async (contact) => {
        const personalizedSubject = replaceVariables(emailSubject, contact);
        const personalizedBody = replaceVariables(emailBody, contact);
        const personalizedSignature = replaceVariables(emailSignature, contact);
        
        // Combine body and signature
        const fullEmailContent = personalizedSignature.trim() 
          ? `${personalizedBody}\n\n${personalizedSignature}`
          : personalizedBody;
        
        // Convert to HTML format for email sending
        const htmlBody = fullEmailContent.replace(/\n/g, '<br>');
        
        // Send individual email using backend API
        return sendIndividualEmail({
          to_emails: [contact.contact_email],
          subject: personalizedSubject,
          body_text: fullEmailContent,
          body_html: htmlBody,
          priority: 5, // Normal priority
          metadata: {
            bulk_email_contact_id: contact.id,
            company_name: contact.company_name,
            contact_name: contact.contact_name,
            group_name: contact.group_name,
            sent_at: new Date().toISOString()
          }
        }, { tenant_id: currentTenant?.id || '' });
      });
      
      // Wait for all emails to be sent
      const results = await Promise.allSettled(emailPromises);
      
      // Count successful and failed sends
      let successCount = 0;
      let failedCount = 0;
      const failedContacts: string[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failedCount++;
          failedContacts.push(bulkSendData.selectedContacts[index].contact_name);
        }
      });
      
      // Log sending results to console
      console.log(`Bulk email send completed: ${successCount} success, ${failedCount} failed`);
      if (failedContacts.length > 0) {
        console.log('Failed contacts:', failedContacts);
      }

      // Show appropriate success/error message
      if (successCount > 0 && failedCount === 0) {
        toast({
          title: "送信完了",
          description: `${successCount}件のメールを正常に送信しました。`,
        });
      } else if (successCount > 0 && failedCount > 0) {
        toast({
          title: "部分的成功",
          description: `${successCount}件送信成功、${failedCount}件失敗しました。失敗した宛先を確認してください。`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "送信失敗",
          description: `全てのメール送信に失敗しました。SMTP設定を確認してください。${failedContacts.length > 0 ? `\n失敗: ${failedContacts.slice(0, 3).join(', ')}${failedContacts.length > 3 ? '...' : ''}` : ''}`,
          variant: "destructive"
        });
      }
      
      // Clear selections and form only if all emails were successful
      if (failedCount === 0) {
        setSelectedContacts(new Set());
        setEmailSubject('');
        setEmailBody('');
        setEmailSignature('');
      }
      
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "エラー",
        description: "メール送信に失敗しました。",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="w-full max-w-none mx-auto p-2 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 japanese-text">一括送信</h1>
          </div>
          <p className="text-gray-600 text-lg japanese-text">
            会社リストを管理し、効率的にメールを送信します。
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Panel - Customer Selection */}
          <div className="xl:col-span-5 lg:col-span-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 japanese-text text-lg">
                  <div className="bg-blue-500 p-1.5 rounded-md">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  会社選択エリア
                </CardTitle>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                  <Select value={filterGroup} onValueChange={setFilterGroup}>
                    <SelectTrigger className="w-32 bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {uniqueGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white shadow-md" 
                        onClick={() => {
                          setEditingContact(null);
                          setFormData({
                            company_name: '',
                            contact_name: '',
                            contact_email: '',
                            contact_position: '',
                            group_name: 'デフォルトグループ',
                            group_color: '#3B82F6',
                            notes: ''
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        新規追加
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="japanese-text">
                          {editingContact ? '会社編集' : '会社追加'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="company_name" className="japanese-text">会社名</Label>
                            <Input
                              id="company_name"
                              value={formData.company_name}
                              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact_name" className="japanese-text">担当者名</Label>
                            <Input
                              id="contact_name"
                              value={formData.contact_name}
                              onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="contact_email" className="japanese-text">メールアドレス</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_position" className="japanese-text">役職</Label>
                          <Input
                            id="contact_position"
                            value={formData.contact_position}
                            onChange={(e) => setFormData({...formData, contact_position: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="group_name" className="japanese-text">グループ名</Label>
                            <Input
                              id="group_name"
                              value={formData.group_name}
                              onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="group_color" className="japanese-text">グループ色</Label>
                            <div className="flex gap-2">
                              {groupColors.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`w-8 h-8 rounded-full border-2 ${formData.group_color === color ? 'border-gray-800' : 'border-gray-300'}`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setFormData({...formData, group_color: color})}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="notes" className="japanese-text">備考</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsContactDialogOpen(false)}
                          >
                            キャンセル
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {editingContact ? '更新' : '追加'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 shadow-md">
                        <Upload className="h-4 w-4 mr-2" />
                        インポート
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={downloadCSVTemplate}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        テンプレートダウンロード（サンプル付き）
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadEmptyCSVTemplate}>
                        <FileDown className="h-4 w-4 mr-2" />
                        空のテンプレートダウンロード
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        CSVファイルをインポート
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[750px] rounded-lg border border-gray-100 bg-gray-50/30 p-2">
                  <div className="space-y-4">
                    {/* Group View */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-semibold text-sm japanese-text text-gray-700">グループ別</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsGroupSectionCollapsed(!isGroupSectionCollapsed)}
                          className="h-6 px-2"
                        >
                          {isGroupSectionCollapsed ? (
                            <>
                              <ChevronRight className="h-4 w-4 mr-1" />
                              展開
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              折りたたむ
                            </>
                          )}
                        </Button>
                      </div>
                      {!isGroupSectionCollapsed && Object.values(groupedByGroup).map((group) => (
                        <div key={group.group_name} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={group.selected}
                                onCheckedChange={() => toggleGroupSelection(group.group_name)}
                              />
                              <Badge 
                                variant="secondary" 
                                className="text-white text-xs"
                                style={{ backgroundColor: group.group_color }}
                              >
                                {group.group_name}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                ({group.contacts.length})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleGroupCollapse(group.group_name)}
                              className="h-6 w-6 p-0"
                            >
                              {collapsedGroups.has(group.group_name) ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!collapsedGroups.has(group.group_name) && group.contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center gap-2 pl-6">
                              <Checkbox
                                checked={selectedContacts.has(contact.id)}
                                onCheckedChange={() => toggleContactSelection(contact.id)}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{contact.contact_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {contact.company_name} {contact.contact_position && `・${contact.contact_position}`}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingContact(contact);
                                    setFormData({
                                      company_name: contact.company_name,
                                      contact_name: contact.contact_name,
                                      contact_email: contact.contact_email,
                                      contact_position: contact.contact_position || '',
                                      group_name: contact.group_name,
                                      group_color: contact.group_color,
                                      notes: contact.notes || ''
                                    });
                                    setIsContactDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteContact(contact.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Company View */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-semibold text-sm japanese-text text-gray-700">会社別</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsCompanySectionCollapsed(!isCompanySectionCollapsed)}
                          className="h-6 px-2"
                        >
                          {isCompanySectionCollapsed ? (
                            <>
                              <ChevronRight className="h-4 w-4 mr-1" />
                              展開
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              折りたたむ
                            </>
                          )}
                        </Button>
                      </div>
                      {!isCompanySectionCollapsed && Object.values(groupedByCompany).map((company) => (
                        <div key={company.company_name} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={company.selected}
                                onCheckedChange={() => toggleCompanySelection(company.company_name)}
                              />
                              <Building className="h-4 w-4" />
                              <span className="font-medium text-sm">{company.company_name}</span>
                              <span className="text-sm text-muted-foreground">
                                ({company.contacts.length})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCompanyCollapse(company.company_name)}
                              className="h-6 w-6 p-0"
                            >
                              {collapsedCompanies.has(company.company_name) ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {!collapsedCompanies.has(company.company_name) && company.contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center gap-2 pl-6">
                              <Checkbox
                                checked={selectedContacts.has(contact.id)}
                                onCheckedChange={() => toggleContactSelection(contact.id)}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{contact.contact_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {contact.contact_position && `${contact.contact_position} ・ `}
                                  {contact.contact_email}
                                </p>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="text-white text-xs"
                                style={{ backgroundColor: contact.group_color }}
                              >
                                {contact.group_name}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Email Composition */}
          <div className="xl:col-span-7 lg:col-span-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 japanese-text text-lg">
                  <div className="bg-green-500 p-1.5 rounded-md">
                    <Send className="h-4 w-4 text-white" />
                  </div>
                  メール作成エリア
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Recipients Display */}
                <div>
                  <Label className="text-sm font-medium japanese-text">受信者</Label>
                  <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                    {selectedContacts.size === 0 ? (
                      <p className="text-sm text-muted-foreground japanese-text">
                        左側から受信者を選択してください
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          選択済み: {selectedContacts.size}名
                        </p>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {contacts
                              .filter(c => selectedContacts.has(c.id))
                              .map(contact => (
                                <div key={contact.id} className="flex items-center gap-2 text-sm">
                                  <Badge 
                                    variant="secondary" 
                                    className="text-white text-xs"
                                    style={{ backgroundColor: contact.group_color }}
                                  >
                                    {contact.group_name}
                                  </Badge>
                                  <span>{contact.contact_name}</span>
                                  <span className="text-muted-foreground">
                                    ({contact.company_name})
                                  </span>
                                  <span className="text-muted-foreground">
                                    {contact.contact_email}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <Label htmlFor="email_subject" className="text-sm font-medium japanese-text">
                    件名
                  </Label>
                  <Input
                    id="email_subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="メールの件名を入力してください"
                    className="mt-2"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <Label htmlFor="email_body" className="text-sm font-medium japanese-text">
                    本文
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground japanese-text">
                        使用可能な変数: {`{{company_name}}, {{contact_name}}, {{contact_position}}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {emailBody.length} 文字
                      </div>
                    </div>
                    <Textarea
                      id="email_body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="{{company_name}} 御中&#13;&#10;&#13;&#10;いつもお世話になっております。&#13;&#10;{{contact_name}}様&#13;&#10;&#13;&#10;この度は貴重なお時間をいただき、ありがとうございます。&#13;&#10;&#13;&#10;弊社では現在、以下のようなエンジニアの方々をご紹介可能です：&#13;&#10;&#13;&#10;・経験豊富なシステムエンジニア&#13;&#10;・最新技術に精通したプログラマー&#13;&#10;・プロジェクトマネジメント経験者&#13;&#10;&#13;&#10;ご興味がございましたら、お気軽にお声かけください。&#13;&#10;&#13;&#10;何かご質問等ございましたら、いつでもお申し付けください。&#13;&#10;&#13;&#10;今後ともよろしくお願いいたします。"
                      rows={15}
                      className="resize-y min-h-[200px] max-h-[500px]"
                    />
                  </div>
                </div>

                {/* Email Signature */}
                <div>
                  <Label htmlFor="email_signature" className="text-sm font-medium japanese-text">
                    署名
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground japanese-text">
                        メールの最後に自動で追加される署名
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {emailSignature.length} 文字
                      </div>
                    </div>
                    <Textarea
                      id="email_signature"
                      value={emailSignature}
                      onChange={(e) => setEmailSignature(e.target.value)}
                      placeholder="--&#13;&#10;山田太郎&#13;&#10;株式会社サンプル&#13;&#10;営業部&#13;&#10;TEL: 03-1234-5678&#13;&#10;EMAIL: yamada@sample.co.jp"
                      rows={6}
                      className="resize-y min-h-[100px] max-h-[200px]"
                    />
                  </div>
                </div>

                {/* Email Preview */}
                {emailBody.trim() && (
                  <div>
                    <Label className="text-sm font-medium japanese-text">プレビュー</Label>
                    <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-amber-50/50 to-yellow-50/50">
                      <div className="text-xs text-muted-foreground mb-2">
                        ※ 実際のメールでは変数が各会社の情報に置き換えられます
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {emailBody}
                        {emailSignature.trim() && (
                          <>
                            {'\n\n'}
                            {emailSignature}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}


                {/* Send Button */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button 
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setSelectedContacts(new Set());
                      setEmailSubject('');
                      setEmailBody('');
                      setEmailSignature('');
                    }}
                  >
                    クリア
                  </Button>
                  <Button 
                    onClick={handleBulkSend}
                    disabled={loading || selectedContacts.size === 0}
                    className="min-w-40 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        送信中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        一括送信 ({selectedContacts.size})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>

      {/* CSV Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
        setIsImportDialogOpen(open);
        if (!open) resetImportDialog();
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 japanese-text">
              <FileSpreadsheet className="h-5 w-5" />
              CSVファイルインポート
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload Section */}
            <div>
              <Label className="text-sm font-medium japanese-text">CSVファイル選択</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleImportFileChange}
                  className="file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-sm file:font-medium"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  ※ CSVファイルは UTF-8 でエンコードされている必要があります
                </div>
              </div>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">有効データ</div>
                      <div className="text-sm text-muted-foreground">{validationResult.validData.length}件</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">エラー</div>
                      <div className="text-sm text-muted-foreground">{validationResult.invalidData.length}件</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">警告</div>
                      <div className="text-sm text-muted-foreground">{validationResult.warnings.length}件</div>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {validationResult.invalidData.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">エラー詳細</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {validationResult.invalidData.map((item, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                          <div className="font-medium">行{item.row}: {item.data.company_name || '未入力'} - {item.data.contact_name || '未入力'}</div>
                          <div className="text-red-600">{item.errors.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {validationResult.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">警告</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {validationResult.warnings.map((warning, index) => (
                        <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                          {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview of Valid Data */}
                {validationResult.validData.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">インポートされるデータ（最初の5件）</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="p-2 text-left">会社名</th>
                              <th className="p-2 text-left">担当者名</th>
                              <th className="p-2 text-left">メール</th>
                              <th className="p-2 text-left">役職</th>
                              <th className="p-2 text-left">グループ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {validationResult.validData.slice(0, 5).map((contact, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{contact.company_name}</td>
                                <td className="p-2">{contact.contact_name}</td>
                                <td className="p-2">{contact.contact_email}</td>
                                <td className="p-2">{contact.contact_position || '-'}</td>
                                <td className="p-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="text-white"
                                    style={{ backgroundColor: contact.group_color }}
                                  >
                                    {contact.group_name}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {validationResult.validData.length > 5 && (
                        <div className="p-2 text-center text-sm text-muted-foreground bg-muted">
                          ...他{validationResult.validData.length - 5}件
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsImportDialogOpen(false)}
                disabled={isImporting}
              >
                キャンセル
              </Button>
              {validationResult && validationResult.validData.length > 0 && (
                <Button 
                  onClick={handleImportExecute}
                  disabled={isImporting}
                  className="min-w-32"
                >
                  {isImporting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      インポート中...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      インポート実行 ({validationResult.validData.length}件)
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Send Confirmation Dialog */}
      <Dialog open={isBulkSendDialogOpen} onOpenChange={setIsBulkSendDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 japanese-text text-lg">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Send className="h-5 w-5 text-white" />
              </div>
              メール送信確認
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Confirmation Message */}
            <div className="text-center py-4">
              <div className="text-lg font-medium text-gray-800 mb-2">
                {bulkSendData?.confirmMessage}
              </div>
              <div className="text-sm text-gray-600">
                以下の宛先にメールを送信します。
              </div>
            </div>

            {/* Recipients List */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">送信先リスト</span>
              </div>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {bulkSendData?.selectedContacts.map((contact, index) => (
                    <div key={contact.id} className="flex items-center gap-2 text-sm py-1">
                      <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                      <Badge 
                        variant="secondary" 
                        className="text-white text-xs"
                        style={{ backgroundColor: contact.group_color }}
                      >
                        {contact.group_name}
                      </Badge>
                      <span className="font-medium">{contact.contact_name}</span>
                      <span className="text-gray-500">({contact.company_name})</span>
                      <span className="text-gray-400 text-xs">{contact.contact_email}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Email Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-amber-50/30 to-yellow-50/30">
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">メール内容</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">件名：</span>
                  <span className="text-gray-700">{emailSubject}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">本文：</span>
                  <div className="text-gray-700 text-xs mt-1 p-2 bg-white/50 rounded border max-h-20 overflow-y-auto">
                    {emailBody.substring(0, 100)}
                    {emailBody.length > 100 && '...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-700">
                <div className="font-medium mb-1">注意事項</div>
                <div>
                  • 送信後はメールの取り消しはできません<br />
                  • 変数（{`{{company_name}}`}等）は各宛先の情報に自動で置き換わります<br />
                  • 送信完了まで画面を閉じないでください
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setIsBulkSendDialogOpen(false)}
                className="min-w-24"
              >
                キャンセル
              </Button>
              <Button 
                onClick={handleConfirmedBulkSend}
                className="min-w-24 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                送信実行
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default BulkEmail;