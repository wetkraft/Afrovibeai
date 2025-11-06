
"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand, Undo2 } from "lucide-react";

type RefineImageFormProps = {
  refinePrompt: string;
  setRefinePrompt: (prompt: string) => void;
  refining: boolean;
  handleRefine: () => void;
  canUndo: boolean;
  handleUndo: () => void;
};

export default function RefineImageForm({
  refinePrompt,
  setRefinePrompt,
  refining,
  handleRefine,
  canUndo,
  handleUndo,
}: RefineImageFormProps) {
  return (
    <div className="mt-4 space-y-2">
        <Textarea
            id="refine-prompt"
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
            placeholder="Describe changes, e.g., 'make it more vibrant...'"
            className="text-sm"
            rows={2}
        />
        <div className="flex gap-2">
            <Button
                onClick={handleRefine}
                disabled={refining}
                className="w-full"
                size="lg"
            >
              {refining ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wand />
              )}
              <span>{refining ? "Refining..." : "Refine"}</span>
            </Button>
            {canUndo && (
              <Button
                onClick={handleUndo}
                disabled={refining}
                variant="outline"
                size="lg"
              >
                  <Undo2 />
                  <span>Undo</span>
              </Button>
            )}
        </div>
    </div>
  );
}
