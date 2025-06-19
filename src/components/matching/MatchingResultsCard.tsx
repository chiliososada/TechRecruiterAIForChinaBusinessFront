
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { EnhancedMatchingResult } from './types';

interface MatchingResultsCardProps {
  title?: string;
  description?: string;
  matches?: { id: string; name: string; skills: string[] }[];
  results?: EnhancedMatchingResult[];
  currentPage?: number;
  itemsPerPage?: number;
  setCurrentPage?: (page: number) => void;
  exportButtonText?: string;
  actionButtonText?: string;
}

export const MatchingResultsCard: React.FC<MatchingResultsCardProps> = ({
  title = "マッチング結果",
  description = "以下の候補が見つかりました",
  matches,
  results,
  currentPage = 1,
  itemsPerPage = 5,
  setCurrentPage = () => {},
  exportButtonText,
  actionButtonText
}) => {
  // Use internal state if no external pagination control is provided
  const [internalPage, setInternalPage] = useState(1);
  const effectiveCurrentPage = currentPage || internalPage;
  const handlePageChange = (page: number) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    } else {
      setInternalPage(page);
    }
  };

  // Use either matches or results based on which prop is provided
  const dataToDisplay = results || matches;
  const totalPages = dataToDisplay ? Math.ceil(dataToDisplay.length / itemsPerPage) : 0;
  const paginatedItems = dataToDisplay ? 
    dataToDisplay.slice(
      (effectiveCurrentPage - 1) * itemsPerPage, 
      effectiveCurrentPage * itemsPerPage
    ) : [];

  // Render different item based on data type
  const renderItem = (item: any, index: number) => {
    if (item.hasOwnProperty('name') && item.hasOwnProperty('skills')) {
      // Render match item (candidate)
      return (
        <li key={item.id} className="border rounded-md p-4">
          <h3 className="text-md font-medium japanese-text">{item.name}</h3>
          <div className="mt-2">
            {item.skills.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="mr-2 japanese-text">{skill}</Badge>
            ))}
          </div>
        </li>
      );
    } else if (item.hasOwnProperty('candidate') && item.hasOwnProperty('case')) {
      // Render result item (matching result)
      return (
        <li key={item.id} className="border rounded-md p-4">
          <div className="flex flex-wrap justify-between items-center">
            <h3 className="text-md font-medium japanese-text">{item.candidate} → {item.case}</h3>
            <Badge className={`${item.statusClass} japanese-text`}>{item.status}</Badge>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>マッチング率: <span className="font-semibold">{item.matchingRate}</span></p>
            <p>理由: {item.matchingReason}</p>
          </div>
          {item.candidateCompany && (
            <div className="mt-2 text-xs text-gray-500">
              <p>{item.candidateCompany} / {item.caseCompany}</p>
            </div>
          )}
        </li>
      );
    }
    // Fallback for unknown data format
    return <li key={index} className="border rounded-md p-4">データ形式が不明です</li>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold japanese-text">{title}</CardTitle>
        <CardDescription className="japanese-text">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-none space-y-4">
          {paginatedItems.map((item, index) => renderItem(item, index))}
        </ul>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={effectiveCurrentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchingResultsCard;
