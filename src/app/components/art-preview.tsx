
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NextImage from "next/image";
import { Download, Copy, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ArtPreviewProps = {
  resultDataUrl: string | null;
  generating: boolean;
  progress: number;
  ratio: string;
};

export default function ArtPreview({ resultDataUrl, generating, progress, ratio }: ArtPreviewProps) {
  const { toast } = useToast();
  
  // Convert ratio string "w:h" to a numeric aspect ratio w/h
  const [w, h] = (ratio || "1:1").split(':').map(Number);
  const aspectRatio = w / h;

  function dataURLToDownloadLink(dataUrl: string, filename = "cover.png") {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function copyDataUrl() {
    if (resultDataUrl) {
      navigator.clipboard.writeText(resultDataUrl);
      toast({
        title: "Copied to clipboard!",
        description: "The Data URL is ready to be pasted.",
      });
    }
  }

  return (
    <div className={cn(
      "relative rounded-lg p-px",
      generating && "bg-gradient-to-r from-primary via-red-500 to-yellow-500 animate-border-rgb"
    )}>
      <Card className="flex flex-col bg-card/50 backdrop-blur-sm">
        <CardContent className="flex-1 flex items-center justify-center p-4">
          <div className="w-full">
            <div
              className="relative w-full rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center shadow-inner"
              style={{ aspectRatio: `${aspectRatio}` }}
            >
                {generating ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                    <Loader2 className="w-10 h-10 mb-4 animate-spin text-primary" />
                    <p className="font-semibold text-base mb-2">Generating...</p>
                    <p className="text-xs mb-4">
                      The AI is dreaming up your artwork.
                    </p>
                    <Progress value={progress} className="w-full max-w-xs h-2" />
                  </div>
                ) : resultDataUrl ? (
                  <NextImage
                    src={resultDataUrl}
                    alt="Generated cover art"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm font-medium">Your art will appear here</p>
                  </div>
                )}
            </div>
          </div>
        </CardContent>
        {resultDataUrl && !generating && (
          <CardFooter className="flex flex-col sm:flex-row gap-2 p-4 pt-0">
            <Button
              onClick={() => resultDataUrl && dataURLToDownloadLink(resultDataUrl)}
              disabled={!resultDataUrl || generating}
              className="w-full sm:w-auto flex-1"
              variant="secondary"
            >
              <Download />
              <span>Download PNG</span>
            </Button>
            <Button
              onClick={copyDataUrl}
              disabled={!resultDataUrl || generating}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Copy />
              <span>Copy Data URL</span>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
