
import React from 'react';

const EmptyJobList: React.FC = () => {
  return (
    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-gray-500 text-lg">표시할 채용 정보가 없습니다.</div>
      <div className="text-gray-400 text-sm mt-2">새로운 추천 채용 정보를 가져오려면 '추천 채용 정보 가져오기' 버튼을 클릭하세요.</div>
    </div>
  );
};

export default React.memo(EmptyJobList);
