import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3100;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let companies = [
  {
    _id: '1',
    firmId: 'FIRM001',
    companyName: 'ABC Corporation Ltd',
    firmAddress1: '123 Main Street',
    firmAddress2: 'Building A, Floor 2',
    firmAddress3: 'Business District',
    pinCode: '400001',
    gstNo: '27ABCDE1234F1Z5',
    panNo: 'ABCDE1234F',
    contactNo: '9876543210',
    emailId: 'info@abccorp.com',
    isActive: true,
    createdBy: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    createdAt: '2023-09-06T11:00:00.000Z',
    updatedAt: '2023-09-06T11:00:00.000Z'
  },
  {
    _id: '2',
    firmId: 'FIRM002',
    companyName: 'XYZ Industries',
    firmAddress1: '456 Industrial Park',
    firmAddress2: 'Sector 5',
    firmAddress3: 'Industrial Area',
    pinCode: '110001',
    gstNo: '07FGHIJ5678K1Z5',
    panNo: 'FGHIJ5678K',
    contactNo: '9876543211',
    emailId: 'contact@xyzindustries.com',
    isActive: true,
    createdBy: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    createdAt: '2023-09-06T12:00:00.000Z',
    updatedAt: '2023-09-06T12:00:00.000Z'
  }
];

// Simple auth middleware (for testing)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  // For testing, accept any Bearer token
  next();
};

// Routes
app.get('/companies', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    
    let filteredCompanies = [...companies];
    
    // Apply search filter
    if (search) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.companyName.toLowerCase().includes(search.toLowerCase()) ||
        company.firmId.toLowerCase().includes(search.toLowerCase()) ||
        company.gstNo.toLowerCase().includes(search.toLowerCase()) ||
        company.panNo.toLowerCase().includes(search.toLowerCase()) ||
        company.emailId.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply status filter
    if (isActive !== undefined) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.isActive === (isActive === 'true')
      );
    }
    
    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);
    
    const totalItems = filteredCompanies.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    
    res.json({
      success: true,
      data: paginatedCompanies,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get individual company by ID
app.get('/companies/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const company = companies.find(c => c._id === id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/companies', authMiddleware, (req, res) => {
  try {
    const {
      firmId,
      companyName,
      firmAddress1,
      firmAddress2,
      firmAddress3,
      pinCode,
      gstNo,
      panNo,
      contactNo,
      emailId
    } = req.body;
    
    // Validation
    const errors = [];
    if (!firmId) errors.push('FIRM ID is required');
    if (!companyName) errors.push('Company name is required');
    if (!firmAddress1) errors.push('Address is required');
    if (!pinCode || !/^\d{6}$/.test(pinCode)) errors.push('Please enter a valid 6-digit PIN code');
    if (!gstNo || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNo)) {
      errors.push('Please enter a valid GST number');
    }
    if (!panNo || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNo)) {
      errors.push('Please enter a valid PAN number');
    }
    if (!contactNo || !/^\d{10}$/.test(contactNo)) {
      errors.push('Please enter a valid 10-digit contact number');
    }
    if (!emailId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
      errors.push('Please enter a valid email address');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Check if firmId already exists
    if (companies.find(c => c.firmId === firmId)) {
      return res.status(400).json({
        success: false,
        message: 'FIRM ID already exists'
      });
    }
    
    const newCompany = {
      _id: Date.now().toString(),
      firmId,
      companyName,
      firmAddress1,
      firmAddress2,
      firmAddress3,
      pinCode,
      gstNo,
      panNo,
      contactNo,
      emailId,
      isActive: true,
      createdBy: {
        _id: 'user1',
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    companies.push(newCompany);
    
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: newCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.put('/companies/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const companyIndex = companies.findIndex(c => c._id === id);
    
    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const {
      firmId,
      companyName,
      firmAddress1,
      firmAddress2,
      firmAddress3,
      pinCode,
      gstNo,
      panNo,
      contactNo,
      emailId
    } = req.body;
    
    // Validation
    const errors = [];
    if (!firmId) errors.push('FIRM ID is required');
    if (!companyName) errors.push('Company name is required');
    if (!firmAddress1) errors.push('Address is required');
    if (!pinCode || !/^\d{6}$/.test(pinCode)) errors.push('Please enter a valid 6-digit PIN code');
    if (!gstNo || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNo)) {
      errors.push('Please enter a valid GST number');
    }
    if (!panNo || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNo)) {
      errors.push('Please enter a valid PAN number');
    }
    if (!contactNo || !/^\d{10}$/.test(contactNo)) {
      errors.push('Please enter a valid 10-digit contact number');
    }
    if (!emailId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
      errors.push('Please enter a valid email address');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Check if firmId already exists (excluding current company)
    if (companies.find(c => c.firmId === firmId && c._id !== id)) {
      return res.status(400).json({
        success: false,
        message: 'FIRM ID already exists'
      });
    }
    
    companies[companyIndex] = {
      ...companies[companyIndex],
      firmId,
      companyName,
      firmAddress1,
      firmAddress2,
      firmAddress3,
      pinCode,
      gstNo,
      panNo,
      contactNo,
      emailId,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Company updated successfully',
      data: companies[companyIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.delete('/companies/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const companyIndex = companies.findIndex(c => c._id === id);
    
    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    companies.splice(companyIndex, 1);
    
    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('GET  /companies - Get all companies');
  console.log('POST /companies - Create new company');
  console.log('PUT  /companies/:id - Update company');
  console.log('DELETE /companies/:id - Delete company');
});
