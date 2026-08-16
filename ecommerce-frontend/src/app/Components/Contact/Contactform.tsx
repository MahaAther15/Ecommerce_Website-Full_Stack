"use client";

import { useState } from "react";
import { ContactFormData, ContactFormErrors } from "@/app/types/contact";
import { TeamMember } from "@/app/types/team";
import teamData from "@/app/data/team.json";

const teamMembers: TeamMember[] = teamData;


export default function Contactform() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: ContactFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // .NET DataAnnotation validation parity: [Required], [StringLength(100, MinimumLength = 2)]
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    // .NET DataAnnotation validation parity: [Required], [EmailAddress]
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // .NET DataAnnotation validation parity: [Required], [StringLength(150, MinimumLength = 3)]
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters.";
    }

    // .NET DataAnnotation validation parity: [Required], [StringLength(2000, MinimumLength = 10)]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Form is valid and ready for backend API (.NET Controller / api/contact)
      setSubmitted(true);
      alert("Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    }
  };

  return (
    <section id="form-details">
      <form onSubmit={handleSubmit} noValidate>
        <span>LEAVE A MESSAGE</span>
        <h2>We love to hear from you</h2>

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

        <button type="submit" className="normal">
          Submit
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
