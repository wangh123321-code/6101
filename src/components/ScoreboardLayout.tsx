import TableListPanel from './TableListPanel';
import DetailPanelArea from './DetailPanelArea';

export default function ScoreboardLayout() {
  return (
    <div className="h-full flex">
      <TableListPanel />
      <DetailPanelArea />
    </div>
  );
}
