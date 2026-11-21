/* eslint-disable @typescript-eslint/no-explicit-any -- Campos/tabelas legados ainda não constam nos tipos gerados do Supabase; manter a lógica existente. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Star, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Review = { id: string; task_id: string; user_id: string; rating: number; comment: string; created_at: string; };

export default function AdminAvaliacoes() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate("/login"); return; }
    if (!isAdmin) { navigate("/dashboard"); return; }
    (supabase as any).from("task_reviews").select("*").order("created_at", { ascending: false })
      .then(({ data, error }: any) => {
        if (error) toast({ title: "Erro", description: "Não foi possível carregar as avaliações.", variant: "destructive" });
        else setItems(data || []);
        setLoading(false);
      });
  }, [user, isAdmin, isLoading, navigate, toast]);

  const remove = async (id: string) => {
    setDeleting(id);
    const { error } = await (supabase as any).from("task_reviews").delete().eq("id", id);
    if (error) toast({ title: "Não foi possível eliminar", description: "Apenas a administração pode eliminar comentários.", variant: "destructive" });
    else { setItems(rows => rows.filter(row => row.id !== id)); toast({ title: "Comentário eliminado" }); }
    setDeleting(null);
  };

  return <Layout showFooter={false}><div className="container mx-auto max-w-5xl px-4 py-8">
    <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="mb-5"><ArrowLeft className="mr-2 h-4 w-4" />Painel administrativo</Button>
    <div className="mb-7 flex items-center gap-3"><div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-amber-500 p-3 text-white"><MessageSquare /></div><div><h1 className="text-3xl font-bold">Avaliações dos clientes</h1><p className="text-muted-foreground">Comentários e níveis de satisfação.</p></div></div>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div> : items.length === 0 ? <div className="surface-solid rounded-2xl p-10 text-center">Ainda não existem avaliações.</div> : <div className="space-y-4">{items.map(item => <article key={item.id} className="surface-solid rounded-2xl p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">Tarefa {item.task_id.slice(0, 8)}</p><p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("pt-AO")}</p></div><div className="flex text-amber-600" aria-label={item.rating + " de 5 estrelas"}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={18} className={i < item.rating ? "fill-current" : "opacity-25"} />)}</div></div>
      <p className="whitespace-pre-wrap">{item.comment}</p><div className="mt-4 flex justify-end"><Button variant="destructive" size="sm" disabled={deleting === item.id} onClick={() => void remove(item.id)}>{deleting === item.id ? <Loader2 className="animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Eliminar comentário</Button></div>
    </article>)}</div>}
  </div></Layout>;
}
