/* eslint-disable @typescript-eslint/no-explicit-any -- Campos/tabelas legados ainda não constam nos tipos gerados do Supabase; manter a lógica existente. */
import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function TaskReview({ taskId, taskStatus }: { taskId: string; taskStatus: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || taskStatus !== "completed") return;
    (supabase as any).from("task_reviews").select("*").eq("task_id", taskId).maybeSingle()
      .then(({ data }: any) => { if (data) { setRating(data.rating); setComment(data.comment); setExists(true); } });
  }, [taskId, taskStatus, user]);

  if (taskStatus !== "completed" || !user) return null;

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase as any).from("task_reviews").upsert({
      task_id: taskId, user_id: user.id, rating, comment: comment.trim()
    }, { onConflict: "task_id,user_id" });
    if (error) toast({ title: "Não foi possível guardar", description: "Tente novamente mais tarde.", variant: "destructive" });
    else { setExists(true); toast({ title: "Avaliação guardada", description: "Obrigado por partilhar a sua opinião." }); }
    setSaving(false);
  };

  return <section className="surface-solid rounded-2xl p-5 sm:p-6 mb-6">
    <h2 className="text-xl font-bold mb-1">Avalie o resultado</h2>
    <p className="text-sm text-muted-foreground mb-4">A sua opinião ajuda-nos a melhorar os serviços da PARTISOLFA.</p>
    <div className="mb-4 flex items-center gap-2" role="radiogroup" aria-label="Nível de satisfação">
      {Array.from({ length: 5 }, (_, i) => <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={(i + 1) + " estrelas"} aria-pressed={rating === i + 1} className="rounded-lg p-1 transition-transform hover:scale-110"><Star size={30} className={i < rating ? "fill-amber-400 text-amber-500" : "text-slate-300"} /></button>)}
      <span className="ml-2 text-sm font-semibold text-amber-700">{rating}/5</span>
    </div>
    <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} rows={4} placeholder="Conte-nos o que achou do resultado..." className="w-full rounded-xl border bg-white p-3 text-sm focus:ring-2 focus:ring-primary" />
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">Pode editar o seu comentário. Apenas a administração pode eliminá-lo.</span>
      <Button variant="premium" disabled={saving || comment.trim().length < 3} onClick={() => void save()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{exists ? "Actualizar comentário" : "Enviar avaliação"}</Button>
    </div>
  </section>;
}
