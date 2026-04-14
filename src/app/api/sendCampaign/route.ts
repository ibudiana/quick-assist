import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { subject, body, recipients, recipientCount, senderEmail } =
      await req.json();

    // Validasi input
    if (
      !subject ||
      !body ||
      recipientCount === 0 ||
      !recipients ||
      recipients.length === 0
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: senderEmail,
      to: recipients.join(","),
      subject,
      text: body,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
