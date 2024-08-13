'use client'
import { React, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
      blue: '#2196f3',
    },
    secondary: {
      main: '#f44336',
    },
    third: {
      light: blue[200],
      main: blue[600],
      dark: blue[400],
      darker: blue[700],
    },
  },
});

function formatText(text) {
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/\n/g, '<br/>');
  return formattedText;
}

function DisplayText({ text }) {
  const formattedText = formatText(text);

  return (
    <Typography
      component="div"
      dangerouslySetInnerHTML={{ __html: formattedText }}
      style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', lineHeight: '1.5' }}
    />
  );
}

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hey! Welcome to AdvisorAI, home of all things finance and crypto. How may I assist you today?'
  }]);

  const [message, setMessage] = useState('');

  const sendMessage = async (userMessage) => {
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: userMessage }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new Int8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages, {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });
      return reader.read().then(processText);
    });
  };

  const handleFAQButtonClick = () => {
    sendMessage('FAQ');
  };

  const handleCallButtonClick = () => {
    sendMessage('Advisor AI Phone Number');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        width="100vw"
        height="5vh"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        bgcolor='#0f1214'
        padding={4}
      >
        <Stack width="100vh" direction="row" justifyContent="Space-between">
          <Box><Typography variant="h5" color="white" width="800px">AdvisorAI</Typography></Box>
          <Box><Typography variant="h5" color="white" width="930px">Financial Advisor Agent</Typography></Box>
          <Box><Typography variant="h6" color="white" width="130px" justifyContent="right">My Account</Typography></Box>
        </Stack>
      </Box>
      <Box
        width="100vw"
        height="93vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          direction="column"
          width="1200px"
          height="700px"
          borderRadius={3}
          bgcolor='rgb(40 40 40 / 50%)'
          p={2}
          spacing={2}
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
            padding={1}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : "flex-end"}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? '#2f3037' : 'primary.blue'}
                  color="white"
                  borderRadius={10}
                  p={3}
                >
                  <div>
                    <DisplayText text={message.content} />
                  </div>
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button variant="contained" color="third" onClick={() => sendMessage(message)}>Send</Button>
          </Stack>
        </Stack>
        <Stack direction="row" padding={2} spacing={2}>
          <Button variant="outlined" color="third" onClick={handleFAQButtonClick}>FAQs</Button>
          <Button variant="outlined" color="third"onClick={handleCallButtonClick}> Call Us</Button>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
