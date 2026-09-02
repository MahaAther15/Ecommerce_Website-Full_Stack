"use client";

import { useState } from "react";
import { ContactFormData, ContactFormErrors } from "@/app/types/contact";
import { TeamMember } from "@/app/types/team";
import teamData from "@/app/data/team.json";
import { sendContactMessageApi } from "@/app/libs/contactApi";

const teamMembers: TeamMember[] = teamData;

export default function Contactform() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: ContactFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await sendContactMessageApi(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      setTimeout(() => setSubmitted(false), 7000);
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="form-details">
      <form onSubmit={handleSubmit} noValidate>
        <span>LEAVE A MESSAGE</span>
        <h2>We love to hear from you</h2>

        {submitted && (
          <div
            style={{
              width: "100%",
              padding: "14px 18px",
              backgroundColor: "#e8f6ea",
              border: "1.5px solid #088178",
              borderRadius: "8px",
              color: "#088178",
              fontWeight: "700",
              fontSize: "14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="fas fa-check-circle" style={{ fontSize: "18px" }}></i>
            <span>Thank you! Your message has been sent to our administration.</span>
          </div>
        )}

        <div>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span style={{ color: "red", fontSize: "12px", display: "block", marginBottom: "8px" }}>{errors.name}</span>}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span style={{ color: "red", fontSize: "12px", display: "block", marginBottom: "8px" }}>{errors.email}</span>}
        </div>

        <div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
          />
          {errors.subject && <span style={{ color: "red", fontSize: "12px", display: "block", marginBottom: "8px" }}>{errors.subject}</span>}
        </div>

        <div>
          <textarea
            name="message"
            cols={30}
            rows={10}
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          {errors.message && <span style={{ color: "red", fontSize: "12px", display: "block", marginBottom: "8px" }}>{errors.message}</span>}
        </div>

        <button
          type="submit"
          className="normal"
          disabled={submitting}
          style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Sending..." : "Submit"}
        </button>
      </form>

      <div className="people">
        {teamMembers.map((member) => (
          <div key={member.id}>
            <img src={member.image} alt={member.name} />
            <p>
              <span>{member.name}</span>
              {member.role}
              <br />
              Phone: {member.phone}
              <br />
              Email: {member.email}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
