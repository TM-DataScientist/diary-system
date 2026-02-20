import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <h1 className="text-4xl font-bold">営業日報システム</h1>
      <p className="text-muted-foreground">
        営業担当者の日々の活動を記録・管理するシステム
      </p>
      <div className="flex items-center gap-3">
        <Badge>営業</Badge>
        <Badge variant="secondary">上長</Badge>
        <Badge variant="outline">下書き</Badge>
      </div>
      <div className="flex gap-3">
        <Button>日報を作成</Button>
        <Button variant="outline">一覧を見る</Button>
      </div>
    </main>
  );
}
