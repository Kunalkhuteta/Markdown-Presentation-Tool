import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import Presentation from "../models/presentation.model";
import { Request, Response } from "express";

const createPresentation = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, theme } = req.body;

  const presentation = await Presentation.create({
    title,
    content,
    theme,
    user: req.user.id,
  });

  res.status(201).json(new ApiResponse(200, "Presentation created successfully", presentation));
});

const getPresentations = asyncHandler(async (req: Request, res: Response) => {
  const presentations = await Presentation.find({ user: req.user.id });
  res.status(200).json(new ApiResponse(200, "Presentations fetched successfully", presentations));
});

const getPresentationById = asyncHandler(async (req: Request, res: Response) => {
  const presentation = await Presentation.findById(req.params.id);
  if (!presentation) {
    return res.status(404).json(new ApiError(404, "Presentation not found"));
  }
  res.status(200).json(new ApiResponse(200, "Presentation fetched successfully", presentation));
});

const updatePresentation = asyncHandler(async (req: Request, res: Response) => {
  const presentation = await Presentation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
    if (!presentation) {
    return res.status(404).json(new ApiError(404, "Presentation not found"));
    }
    res.status(200).json(new ApiResponse(200, "Presentation updated successfully", presentation));
});

const deletePresentation = asyncHandler(async (req: Request, res: Response) => {
  const presentation = await Presentation.findByIdAndDelete(req.params.id);

    if (!presentation) {
    return res.status(404).json(new ApiError(404, "Presentation not found"));
    }
    res.status(200).json(new ApiResponse(200, "Presentation deleted successfully", presentation));
});
import PDFDocument from "pdfkit";
import { Readable } from "stream";


const exportPresentation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.query;

  const presentation = await Presentation.findById(id);
  if (!presentation) {
    throw new ApiError(404, "Presentation not found");
  }

  const slides = presentation.content
    .split("---")
    .map((s) => s.trim())
    .filter(Boolean);

  switch (type) {
    case "pdf": {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${presentation.title}.pdf"`
      );
      doc.pipe(res);

      // Title
      doc.fontSize(20).text(presentation.title, { align: "center" });
      doc.moveDown(1);
      doc
        .fontSize(12)
        .text(`Exported on: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(2);

      slides.forEach((slide, i) => {
        if (i > 0) doc.addPage();
        doc.fontSize(18).text(`Slide ${i + 1}`, { underline: true, align: "center" });
        doc.moveDown(1);

        const lines = slide.split("\n");
        lines.forEach((line) => {
          if (line.startsWith("# ")) {
            doc.fontSize(22).text(line.slice(2), { align: "center" });
          } else if (line.startsWith("## ")) {
            doc.fontSize(18).text(line.slice(3), { align: "center" });
          } else if (line.startsWith("- ")) {
            doc.fontSize(14).text("• " + line.slice(2));
          } else if (line.trim()) {
            doc.fontSize(14).text(line);
          }
        });
      });

      doc.end();
      break;
    }

    case "md": {
      res.setHeader("Content-Type", "text/markdown");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${presentation.title}.md"`
      );
      const markdown = `# ${presentation.title}\n\n${presentation.content}`;
      res.send(markdown);
      break;
    }

    case "txt": {
      res.setHeader("Content-Type", "text/plain");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${presentation.title}.txt"`
      );
      const textSlides = slides
        .map((s, i) => `Slide ${i + 1}:\n${s}\n\n`)
        .join("");
      res.send(`${presentation.title}\n\n${textSlides}`);
      break;
    }

    default:
      throw new ApiError(400, "Invalid export type. Use pdf, md, or txt.");
  }
});


export { createPresentation, getPresentations, getPresentationById, updatePresentation, deletePresentation, exportPresentation };
