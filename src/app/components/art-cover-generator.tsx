
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArtGeneratorForm from "./art-generator-form";
import ArtPreview from "./art-preview";
import { useToast } from "@/hooks/use-toast";
import { generateImageFromPrompt, editImageFromPrompt } from "@/app/actions";
import RefineImageForm from "./refine-image-form";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { WarningDialog } from "./warning-dialog";

function imageLoaded(img: HTMLImageElement): Promise<void> {
  return new Promise((res, rej) => {
    if (img.complete && img.naturalWidth) return res();
    img.onload = () => res();
    img.onerror = (err) => rej(err);
  });
}

export default function ArtCoverGenerator() {
  const [title, setTitle] = useState("Song Title");
  const [artist, setArtist] = useState("Artist Name");
  const [prompt, setPrompt] = useState("create a modern album cover");
  const [refinePrompt, setRefinePrompt] = useState("");
  const [ratio, setRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1200");
  const [explicit, setExplicit] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [selectedAIImage, setSelectedAIImage] = useState<string | null>(null);
  const [previousAIImage, setPreviousAIImage] = useState<string | null>(null);

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningContent, setWarningContent] = useState({ title: '', description: '', confirmText: '', onConfirm: () => {} });


  const aspectMap: Record<string, [number, number]> = {
    "1:1": [1, 1], "16:9": [16, 9], "4:5": [4, 5], "9:16": [9, 16],
  };

  useEffect(() => {
    if (user && user.displayName && artist === 'Artist Name') {
      setArtist(user.displayName);
    }
  }, [user, artist]);

  const handleReset = useCallback(() => {
    setTitle("Song Title");
    setArtist(user?.displayName || "Artist Name");
    setPrompt("create a modern album cover");
    setRefinePrompt("");
    setRatio("1:1");
    setResolution("1200");
    setExplicit(false);
    setResultDataUrl(null);
    setSelectedAIImage(null);
    setPreviousAIImage(null);
  }, [user]);

  const drawCanvas = useCallback(async (baseImageUrl: string) => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    if (!canvasRef.current) canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    const [wRatio, hRatio] = aspectMap[ratio] ?? [1, 1];
    const base = parseInt(resolution, 10);
    const width = wRatio >= hRatio ? base : Math.round(base * (wRatio / hRatio));
    const height = hRatio > wRatio ? base : Math.round(base * (hRatio / wRatio));

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = baseImageUrl;

    await imageLoaded(img);

    const sourceRatio = img.width / img.height;
    const targetRatio = width / height;
    let sx = 0, sy = 0, swCrop = img.width, shCrop = img.height;

    if (sourceRatio > targetRatio) {
        swCrop = img.height * targetRatio;
        sx = (img.width - swCrop) / 2;
    } else if (sourceRatio < targetRatio) {
        shCrop = img.width / targetRatio;
        sy = (img.height - shCrop) / 2;
    }

    ctx.drawImage(img, sx, sy, swCrop, shCrop, 0, 0, width, height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    const centerX = width / 2;
    const verticalOffset = height * 0.15; 

    const artistFontSize = Math.max(24, width * 0.04);
    ctx.font = `600 ${artistFontSize}px 'Poppins', sans-serif`;

    const titleFontSize = Math.max(48, width * 0.08);
    ctx.font = `bold ${titleFontSize}px 'Righteous', sans-serif`;

    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const titleY = height / 2 + verticalOffset;
    ctx.fillText(title, centerX, titleY);

    const artistY = titleY - titleFontSize * 1.1;
    ctx.font = `600 ${artistFontSize}px 'Poppins', sans-serif`;
    ctx.fillText(artist, centerX, artistY);
    
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (explicit) {
      const explicitLogo = new Image();
      explicitLogo.crossOrigin = "anonymous";
      explicitLogo.src = "https://i.imgur.com/39i5F59.png";
      await imageLoaded(explicitLogo);

      const logoHeight = Math.max(50, width * 0.08);
      const logoWidth = (explicitLogo.width / explicitLogo.height) * logoHeight;
      const logoPadding = width * 0.03;

      ctx.drawImage(explicitLogo, width - logoWidth - logoPadding, height - logoHeight - logoPadding, logoWidth, logoHeight);
    }

    setResultDataUrl(canvas.toDataURL("image/png"));

  }, [artist, title, ratio, explicit, resolution]);


  const handleDraw = useCallback(async () => {
    const baseImage = selectedAIImage;
    if(baseImage) {
        await drawCanvas(baseImage);
    }
  }, [selectedAIImage, drawCanvas]);
  
  React.useEffect(() => {
    handleDraw();
  }, [selectedAIImage, title, artist, ratio, explicit, resolution, handleDraw]);

  const handleGenerate = async () => {
    if (!user) {
      setWarningContent({
        title: "Authentication Required",
        description: "You need to be logged in to generate an art cover. Please log in or create an account.",
        confirmText: "Log In",
        onConfirm: () => router.push("/login"),
      });
      setIsWarningOpen(true);
      return;
    }

    if (!prompt) {
        setWarningContent({
            title: "Nothing to generate",
            description: "Please provide an AI prompt to generate an image.",
            confirmText: "Okay",
            onConfirm: () => setIsWarningOpen(false)
        });
        setIsWarningOpen(true);
        return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const afrocoins = userDoc.data()?.afrocoins ?? 0;

    if (!userDoc.exists() || afrocoins < 5) {
        setWarningContent({
            title: "Insufficient Afrocoins",
            description: `You need at least 5 Afrocoins to generate an image. You currently have ${afrocoins}.`,
            confirmText: "Get More Coins",
            onConfirm: () => router.push("/profile#buy-afrocoins"),
        });
        setIsWarningOpen(true);
        return;
    }

    setGenerating(true);
    setProgress(0);
    setResultDataUrl(null);
    setSelectedAIImage(null);
    setPreviousAIImage(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        const diff = Math.random() * 10;
        return Math.min(prev + diff, 95);
      });
    }, 500);

    toast({ title: "AI is generating an image...", description: "This might take a moment. 5 Afrocoins will be deducted." });

    try {
        const result = await generateImageFromPrompt({ prompt });
        clearInterval(progressInterval);
        setProgress(100);

        if(!result.imageUrl || result.error) {
          throw new Error(result.error || "AI image generation failed.");
        }
        
        await updateDoc(userRef, {
            afrocoins: increment(-5)
        });
        
        setSelectedAIImage(result.imageUrl);
        toast({ title: "AI image generated!", description: "Your unique image is ready. 5 Afrocoins were deducted." });

    } catch (error: any) {
        console.error("Failed to generate cover:", error);
        clearInterval(progressInterval);
        setProgress(0);
        toast({
            title: "Generation Failed",
            description: error.message || "Something went wrong. Please try again.",
            variant: "destructive",
        });
    } finally {
        setGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!user) {
        setWarningContent({
            title: "Authentication Required",
            description: "You need to be logged in to refine an image.",
            confirmText: "Log In",
            onConfirm: () => router.push("/login"),
        });
        setIsWarningOpen(true);
        return;
    }
    
    if (!refinePrompt) {
        setWarningContent({
            title: "Nothing to refine",
            description: "Please provide a prompt to refine the image.",
            confirmText: "Okay",
            onConfirm: () => setIsWarningOpen(false),
        });
        setIsWarningOpen(true);
        return;
    }

    if (!selectedAIImage) {
        setWarningContent({
            title: "No Image to Refine",
            description: "You must generate an image before you can refine it.",
            confirmText: "Okay",
            onConfirm: () => setIsWarningOpen(false),
        });
        setIsWarningOpen(true);
        return;
    }
    
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const refinedImages = userDoc.data()?.refinedImages ?? 0;

    if (!userDoc.exists() || refinedImages < 1) {
        setWarningContent({
            title: "No Refinements Left",
            description: "You have used all your free image refinements. More ways to get refines are coming soon!",
            confirmText: "Okay",
            onConfirm: () => setIsWarningOpen(false),
        });
        setIsWarningOpen(true);
        return;
    }

    setRefining(true);
    setProgress(0);
    setPreviousAIImage(selectedAIImage);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        const diff = Math.random() * 10;
        return Math.min(prev + diff, 95);
      });
    }, 500);

    try {
        toast({ title: "AI is refining the image...", description: "This might take a moment. 1 refine credit will be used." });
        const result = await editImageFromPrompt({ prompt: refinePrompt, baseImageUrl: selectedAIImage });
        
        clearInterval(progressInterval);
        setProgress(100);

        if(!result.imageUrl || result.error) {
          throw new Error(result.error || "AI image refinement failed.");
        }
        
        await updateDoc(userRef, {
            refinedImages: increment(-1)
        });
        
        setSelectedAIImage(result.imageUrl);
        toast({ title: "AI image refined!", description: "Your refined image is ready. 1 refine credit used." });
        setRefinePrompt("");

    } catch (error: any) {
        console.error("Failed to refine cover:", error);
        clearInterval(progressInterval);
        setProgress(0);
        setPreviousAIImage(null); // Clear previous image on failure
        toast({
            title: "Refinement Failed",
            description: error.message || "Something went wrong. Please try again.",
            variant: "destructive",
        });
    } finally {
        setRefining(false);
    }
  };

  const handleUndo = () => {
    if (!previousAIImage) return;

    setSelectedAIImage(previousAIImage);
    setPreviousAIImage(null); // Clear undo history
    toast({
        title: 'Undo Successful',
        description: 'The previous image has been restored.',
    });
  };


  return (
    <>
      <WarningDialog
        isOpen={isWarningOpen}
        setIsOpen={setIsWarningOpen}
        title={warningContent.title}
        description={warningContent.description}
        onConfirm={warningContent.onConfirm}
        confirmText={warningContent.confirmText}
      />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <ArtGeneratorForm
            title={title}
            setTitle={setTitle}
            artist={artist}
            setArtist={setArtist}
            prompt={prompt}
            setPrompt={setPrompt}
            ratio={ratio}
            setRatio={setRatio}
            resolution={resolution}
            setResolution={setResolution}
            explicit={explicit}
            setExplicit={setExplicit}
            generating={generating}
            handleGenerate={handleGenerate}
            handleReset={handleReset}
          />
        </div>
        <div className="flex flex-col">
            <ArtPreview resultDataUrl={resultDataUrl} generating={generating || refining} progress={progress} ratio={ratio} />
            {selectedAIImage && (
                <RefineImageForm
                    refinePrompt={refinePrompt}
                    setRefinePrompt={setRefinePrompt}
                    refining={refining}
                    handleRefine={handleRefine}
                    canUndo={!!previousAIImage}
                    handleUndo={handleUndo}
                />
            )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
