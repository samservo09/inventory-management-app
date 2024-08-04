'use client';
import Image from "next/image";
import { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from "firebase/firestore";
import { Box, Button, Modal, Stack, TextField, Typography, createTheme, ThemeProvider } from "@mui/material";
import { firestore } from './firebase.js';

const theme = createTheme({
  palette: {
    ochre: {
      main: '#736757',
      light: '#b69a7c',
      dark: '#464034',
      contrastText: '#e0e0d8',
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
        sx={{
          backgroundColor: '#e0e0e0',
          backgroundImage: 'url("/factory-background.jpg")',
          backgroundSize: 'cover',
          padding: { xs: 2, sm: 3 }, // Add padding for smaller screens
        }}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={{ xs: '90%', sm: 400 }} // Responsive width
            bgcolor="white"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
                sx={{ backgroundColor: '#f9f9f9' }}
              />
              <Button
                variant="contained"
                color="ochre"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" color="ochre" onClick={handleOpen}>Add New Item</Button>
        <Box>
          <Box
            width="100%" // Full width
            maxWidth="800px" // Max width
            height="80px"
            bgcolor="#86989d"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ borderRadius: '10px', boxShadow: 3, padding: 2 }}
          >
            <Typography variant="h4" color="#e0e0d8" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>Inventory Items</Typography>
          </Box>
        </Box>
        
        {/* Search Field */}
        <TextField
          variant="outlined"
          placeholder="Search Items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            width: { xs: '90%', sm: '80%', md: '60%' }, // Responsive width
            marginBottom: 2,
            backgroundColor: '#e0e0d8', // Search bar background color
            borderRadius: '10px', // Border radius for search bar
          }} 
        />
        
        <Stack
          width="100%" // Full width
          maxWidth="800px" // Max width
          spacing={2}
          overflow="auto"
        >
          {
            filteredInventory.map(({ name, quantity }) => (
              <Box key={name}
                width="100%"
                minHeight="150px"
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }} // Stack on smaller screens
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#e0e0d8"
                padding={3} // Responsive padding
                sx={{ border: '1px solid #ccc', borderRadius: '10px', boxShadow: 1 }}
              >
                <Typography variant="h5" color="#464034" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h5" color="#464034" textAlign="center">{quantity}</Typography>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                  <Button variant="contained" color="ochre" onClick={() => addItem(name)}>Add</Button>
                  <Button variant="contained" color="ochre" onClick={() => removeItem(name)}>Remove</Button>
                </Stack>
              </Box>
            ))}
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
