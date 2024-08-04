'use client';
import Image from "next/image";
import { useState, useEffect } from 'react';
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from "firebase/firestore";
import { Box, Button, Modal, Stack, TextField, Typography, createTheme, ThemeProvider } from "@mui/material";
import { firestore } from '../firebase.js';

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
          backgroundImage: 'url("/factory-background.jpg")', // Optional background
          backgroundSize: 'cover',
        }}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
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
                color="ochre" // Use your custom color here
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
            width="800px"
            height="100px"
            bgcolor="#86989d"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ borderRadius: '8px', boxShadow: 3 }}
          >
            <Typography variant="h3" color="#e0e0d8">Inventory Items</Typography>
          </Box>
        </Box>
        <Stack
          width="800px"
          height="300px"
          spacing={2}
          overflow="auto"
        >
          {
            inventory.map(({ name, quantity }) => (
              <Box key={name}
                width="100%"
                minHeight="150px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#f0f0f0"
                padding={5}
                sx={{ border: '1px solid #ccc', borderRadius: '4px', boxShadow: 1 }}
              >
                <Typography variant="h5" color="#212121" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h5" color="#212121" textAlign="center">{quantity}</Typography>
                <Stack direction="row" spacing={2}>
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
