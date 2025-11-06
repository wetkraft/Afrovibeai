
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Eraser, Sparkles, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ArtGeneratorFormProps = {
  title: string;
  setTitle: (title: string) => void;
  artist: string;
  setArtist: (artist: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  ratio: string;
  setRatio: (ratio: string) => void;
  resolution: string;
  setResolution: (resolution: string) => void;
  explicit: boolean;
  setExplicit: (explicit: boolean) => void;
  generating: boolean;
  handleGenerate: () => void;
  handleReset: () => void;
};

const ratios = ["1:1", "4:5", "16:9", "9:16"];
const resolutions = ["1200", "2400", "3000"];

export default function ArtGeneratorForm({
  title,
  setTitle,
  artist,
  setArtist,
  prompt,
  setPrompt,
  ratio,
  setRatio,
  resolution,
  setResolution,
  explicit,
  setExplicit,
  generating,
  handleGenerate,
  handleReset,
}: ArtGeneratorFormProps) {
  
  const handleTitleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "Song Title") {
      setTitle("");
    }
  }

  const handleArtistFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "Artist Name") {
      setArtist("");
    }
  }

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setTitle("Song Title");
    }
  }

  const handleArtistBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setArtist("Artist Name");
    }
  }

  return (
    <Card className="flex flex-col flex-1 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Create Your Cover
        </CardTitle>
        <CardDescription>
          Describe the cover art you want the AI to create.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="title">Song Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleTitleFocus}
              onBlur={handleTitleBlur}
              placeholder="e.g., Endless Summer"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="artist">Artist Name</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              onFocus={handleArtistFocus}
              onBlur={handleArtistBlur}
              placeholder="e.g., The Midnight"
              className="text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="prompt">AI Art Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="create a modern album cover"
            className="text-sm"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Describe the background art for your cover. Do not include text.
          </p>
        </div>


        <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                  <Label htmlFor="ratio">Aspect Ratio</Label>
                  <Select value={ratio} onValueChange={setRatio}>
                      <SelectTrigger id="ratio" className="w-full sm:w-[120px] text-sm">
                      <SelectValue placeholder="Select ratio" />
                      </SelectTrigger>
                      <SelectContent>
                      {ratios.map((r) => (
                          <SelectItem key={r} value={r}>
                          {r}
                          </SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-1">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger id="resolution" className="w-full sm:w-[120px] text-sm">
                      <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                      {resolutions.map((r) => (
                          <SelectItem key={r} value={r}>
                          {r}px
                          </SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-5">
                <Checkbox id="explicit" checked={explicit} onCheckedChange={(checked) => setExplicit(Boolean(checked))} />
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Label htmlFor="explicit" className="flex items-center gap-1 cursor-pointer text-sm">
                                Explicit
                                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                            </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Adds a "Parental Advisory" logo to the cover.</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full sm:w-48 relative inline-flex items-center justify-center p-0.5 overflow-hidden group disabled:opacity-50"
          size="lg"
        >
          <span className="absolute w-full h-full bg-gradient-to-r from-primary via-red-500 to-yellow-500 group-hover:animate-border-rgb"></span>
          <span className="relative w-full h-full px-8 py-3 text-base bg-background rounded-[calc(var(--radius)-4px)] transition-all ease-in duration-75 group-hover:bg-opacity-0 flex items-center justify-center gap-2">
            {generating ? (
                <Loader2 className="animate-spin" />
            ) : (
                <Sparkles />
            )}
            <span className="font-bold text-lg">{generating ? "Generating..." : "Generate"}</span>
          </span>
        </Button>

        <Button onClick={handleReset} variant="ghost" className="w-full sm:w-auto">
          <Eraser />
          <span>Reset</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
