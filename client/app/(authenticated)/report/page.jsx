"use client";

import React, { useEffect, useState } from 'react';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReport, setNewReport] = useState({
    title: '',
    reportType: '',
    description: '',
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/reports', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.data.reports);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/reports', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create report');
      }

      const data = await response.json();
      setReports((prevReports) => [data.data.report, ...prevReports]); // Add the new report to the list
      setNewReport({ title: '', reportType: '', description: '' }); // Reset the form
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading reports...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Reports</h1>
      <form onSubmit={handleSubmit}>
        <h2>Create a New Report</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newReport.title}
          onChange={handleChange}
          required
        />
        <select
          name="reportType"
          value={newReport.reportType}
          onChange={handleChange}
          required
        >
          <option value="">Select Report Type</option>
          <option value="Lost Item">Lost Item</option>
          <option value="Security Concern">Security Concern</option>
          {/* Add more report types as needed */}
        </select>
        <textarea
          name="description"
          placeholder="Description"
          value={newReport.description}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit Report</button>
      </form>
      {reports.length === 0 ? (
        <p>No reports available.</p>
      ) : (
        <ul>
          {reports.map(report => (
            <li key={report.id}>
              <h2>{report.title}</h2>
              <p><strong>Type:</strong> {report.reportType}</p>
              <p><strong>Description:</strong> {report.description}</p>
              <p><strong>Submitted by:</strong> {report.user.name} ({report.user.email})</p>
              <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportsPage;
