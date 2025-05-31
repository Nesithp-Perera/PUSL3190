import React, { useState, useEffect } from "react";

const SkillManagement = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/skills", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSkills(data);
        } else {
          console.error("Failed to fetch skills");
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };

    fetchSkills();
  }, []);

  // Add a new skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newSkill.trim() }),
      });

      if (response.ok) {
        const addedSkill = await response.json();
        setSkills([...skills, addedSkill]); // Update the skill list
        setNewSkill("");
        setSuccess(`Skill '${addedSkill.name}' added successfully!`);
        setTimeout(() => setSuccess(""), 3000); // Clear success message after 3 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to add skill");
      }
    } catch (err) {
      console.error("Error adding skill:", err);
      setError("An error occurred. Please try again.");
    }
  };

  // Delete a skill
  const handleDeleteSkill = async (skillId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/skills/${skillId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setSkills(skills.filter((skill) => skill.id !== skillId)); // Remove the skill from the list
        setSuccess("Skill deleted successfully!");
        setTimeout(() => setSuccess(""), 3000); // Clear success message after 3 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to delete skill");
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h1>Skill Management</h1>
      <form onSubmit={handleAddSkill}>
        <div>
          <label>New Skill:</label>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button type="submit">Add Skill</button>
      </form>
      <h2>Existing Skills</h2>
      <ul>
        {skills.map((skill) => (
          <li key={skill.id}>
            {skill.name}
            <button onClick={() => handleDeleteSkill(skill.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillManagement;