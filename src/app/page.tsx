"use client";
import NextImage from "next/image";
import { ChangeEvent, useState } from "react";

interface MediaPreview {
  url: string;
  type: string;
}

export default function Home() {
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [selectedCorner, setSelectedCorner] = useState<string>("top-left");
  const [finalImage, setFinalImage] = useState<string | null>(null);

  const handleMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setMediaPreview({ url: fileURL, type: file.type });
    }
  };

  const handleWatermarkUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const fileURL = URL.createObjectURL(file);
      setWatermarkPreview(fileURL);
    } else {
      alert("Please upload an image file for the watermark.");
    }
  };

  const handleCornerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCorner(event.target.value);
  };

  const addWatermark = async () => {
    if (!mediaPreview || !watermarkPreview) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load the main image
    const mainImage = await loadImage(mediaPreview.url);
    canvas.width = mainImage.width;
    canvas.height = mainImage.height;
    ctx.drawImage(mainImage, 0, 0); // Draw the main image on the canvas

    // Load the watermark image
    const watermarkImage = await loadImage(watermarkPreview);

    // Scale the watermark to a smaller size if necessary (e.g., 20% of main image width)
    const watermarkWidth = mainImage.width * 0.3;
    const watermarkHeight =
      (watermarkWidth / watermarkImage.width) * watermarkImage.height;

    // Calculate the position based on the selected corner
    let x = 0;
    let y = 0;

    switch (selectedCorner) {
      case "top-left":
        x = 0;
        y = 0;
        break;
      case "top-right":
        x = mainImage.width - watermarkWidth;
        y = 0;
        break;
      case "bottom-left":
        x = 0;
        y = mainImage.height - watermarkHeight;
        break;
      case "bottom-right":
        x = mainImage.width - watermarkWidth;
        y = mainImage.height - watermarkHeight;
        break;
      case "center":
        x = (mainImage.width - watermarkWidth) / 2;
        y = (mainImage.height - watermarkHeight) / 2;
        break;
    }

    // Set transparency and draw the watermark image at calculated position
    ctx.globalAlpha = 0.8;
    ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);

    // Convert the canvas to data URL and set it as the final image
    const finalImageURL = canvas.toDataURL("image/png");
    setFinalImage(finalImageURL);
  };

  const downloadImage = () => {
    if (!finalImage) return;
    const link = document.createElement("a");
    link.href = finalImage;
    link.download = "watermarked_image.png";
    link.click();
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("loadImage can only be used in the browser"));
        return;
      }
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  return (
    <div>
      <header>
        <div className="header-title">Gardini Dev Mark&apos;s</div>
      </header>
      <div>
        <div className="intro">
          <div>
            <h1>
              Aplicador de <br></br> marca d&apos;água
            </h1>
            <h2>
              Envie a imagem que deseja e o <br></br>arquivo PNG da sua marca
              <br></br> d&apos;água, e nós cuidamos do resto!
            </h2>
          </div>
          <div className="camera-icon">
            <NextImage
              src="/camera.webp"
              alt="Picture of the author"
              width={300}
              height={300}
              style={{
                borderRadius: "50%",
                borderColor: "#00c6ff",
                borderWidth: "2px",
                borderStyle: "solid",
              }}
            />
          </div>
        </div>
        <div className={"intro"}>{/* Media Upload Input */}</div>
        <div className="intro">
          <div className="card">
            <div className="inputBox">
              <h3>
                <label>Enviar Imagem:</label>
              </h3>
              <input
                type="file"
                accept="image/*, video/*"
                onChange={handleMediaUpload}
              />
            </div>

            {/* Watermark Upload Input */}
            <div className="inputBox">
              <h3>
                <label>Enviar Marca d&apos;água: (png recomendado)</label>
              </h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleWatermarkUpload}
              />
            </div>
            <div className="inputBox">
              <h3>
                <label>Selecione a Posição da Marca d&apos;água:</label>
              </h3>
              <select value={selectedCorner} onChange={handleCornerChange}>
                <option value="top-left">Superior Esquerda</option>
                <option value="top-right">Superior Direita</option>
                <option value="center">Centro</option>
                <option value="bottom-left">Inferior Esquerda</option>
                <option value="bottom-right">Inferior Direita</option>
              </select>
            </div>
            <button onClick={addWatermark}>Add Watermark</button>
          </div>
          <div className="card">
            {!finalImage && <h3>Insira os arquivos necessários</h3>}
            {finalImage && (
              <div className="inputBox">
                <h3>Imagem final:</h3>
                <NextImage
                  src={finalImage}
                  width={400}
                  height={400}
                  alt="Final Watermarked"
                  style={{ maxWidth: "100%" }}
                />
                <button onClick={downloadImage}>Baixar imagem</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
