
import { useState, useEffect } from 'react';
import { MailCase } from '../types';

interface SenderMapperProps {
  paginatedCases: MailCase[];
}

export const useSenderMapper = ({ paginatedCases }: SenderMapperProps) => {
  const [flattenedSenders, setFlattenedSenders] = useState<any[]>([]);

  // Effect to transform cases into flattened senders
  useEffect(() => {
    const senders: any[] = [];
    
    paginatedCases.forEach(caseItem => {
      const keyTechnologies = caseItem.keyTechnologies || caseItem.skills?.join(', ') || '';
      
      // If case has a senders array, process each sender
      if (caseItem.senders && Array.isArray(caseItem.senders) && caseItem.senders.length > 0) {
        caseItem.senders.forEach((sender, index) => {
          // Generate a unique row ID for each sender
          const senderEmail = sender.email || `${sender.name?.replace(/\s+/g, '').toLowerCase()}@example.com`;
          const rowId = `${caseItem.id}-${senderEmail}-${index}`;
          
          senders.push({
            caseId: caseItem.id,
            caseTitle: caseItem.title,
            company: caseItem.company,
            keyTechnologies,
            sender: sender.name || '',
            email: sender.email || '',
            position: sender.position || '',
            registrationType: caseItem.registrationType,
            registeredAt: caseItem.registeredAt,
            originalCase: caseItem,
            rowId
          });
        });
      } 
      // Fallback for cases without senders array
      else {
        const rowId = `${caseItem.id}-${caseItem.senderEmail || 'default'}-0`;
        senders.push({
          caseId: caseItem.id,
          caseTitle: caseItem.title,
          company: caseItem.company,
          keyTechnologies,
          sender: caseItem.sender || caseItem.senderName || '',
          email: caseItem.senderEmail || '',
          position: '',
          registrationType: caseItem.registrationType,
          registeredAt: caseItem.registeredAt,
          originalCase: caseItem,
          rowId
        });
      }
    });

    console.log('Flattened senders:', senders);
    setFlattenedSenders(senders);
  }, [paginatedCases]);

  return { flattenedSenders };
};
