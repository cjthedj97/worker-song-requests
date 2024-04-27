addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method === 'POST') {
        const body = await request.formData();
        const token = body.get('cf-turnstile-response');
        const ip = request.headers.get('CF-Connecting-IP');

        let formData = new FormData();
        formData.append('secret', SECRET_KEY);
        formData.append('response', token);
        formData.append('remoteip', ip);

        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const result = await fetch(url, {
            body: formData,
            method: 'POST',
        });

        const outcome = await result.json();
        if (outcome.success) {
            const requesterName = body.get('fullName');
            const artistName = body.get('artist');
            const songTitle = body.get('song');
            const notes = body.get('message');

            const emailMessage = `
            Requester Name: ${requesterName}
            Artist: ${artistName}
            Song Title: ${songTitle}
            Notes: ${notes}
            `;

            const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [
                        {
                            to: [{ email: 'user@example.com' }],
                            dkim_domain: 'example.com',
                            dkim_selector: 'mailchannels',
                            dkim_private_key: DKIM_PRIVATE_KEY
                        },
                    ],
                    from: {
                        email: 'noreply@example.com',
                        name: 'Music Request'
                    },
                    subject: 'Music Request',
                    content: [{
                        type: 'text/plain',
                        value: emailMessage
                    }]
                })
            });

            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Request Submited</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                .bg-image{
                    background-image: url("https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd");
                    background-size: cover;
                    background-position: center center;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    right: 0;
                    z-index: -1;
                }
                </style>

            </head>
            <body>
            <div class="bg-image"></div>
                <div class="vh-100 d-flex justify-content-center align-items-center">
                    <div class="col-md-4">
                        <div class="card  bg-white shadow p-5">
                            <div class="mb-4 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="text-success" width="75" height="75"
                                    fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path
                                        d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                                </svg>
                            </div>
                            <div class="text-center">
                                <h1>Rocking it! 🎸🔥</h1>
                                <p>Your requested track has been added to the queue for consideration! We'll ensure it's rock-solid before pressing play.</p>
                                <a href="/" class="btn btn-outline-success">Submit Another</a>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            return new Response(htmlContent, {
                headers: { 'content-type': 'text/html' }
            });
        } else {
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Something went wrong</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                .bg-image{
                    background-image: url("https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd");
                    background-size: cover;
                    background-position: center center;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    right: 0;
                    z-index: -1;
                }
                </style>

            </head>
            <body>
            <div class="bg-image"></div>
                <div class="vh-100 d-flex justify-content-center align-items-center">
                    <div class="col-md-4">
                        <div class="card  bg-white shadow p-5">
                            <div class="mb-4 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 24 24" fill="none" stroke="#FA5252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            </div>
                            <div class="text-center">
                                <h1>Something went wrong</h1>
                                <p>Make sure to verify the challenge and try again.</p>
                                <a href="/" class="btn btn-outline-success">Try Again</a>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            return new Response(htmlContent, {
                headers: { 'content-type': 'text/html' }
            });        }
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Music Request Form</title>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script>
        <style>
            @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap");
            
            /* Universal styling */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: "Poppins", sans-serif;
            }
    
            body {
                background: rgb(233, 233, 233);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
            }
    
            .bg-image{
                background-image: url("https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd");
                background-size: cover;
                background-position: center center;
                height: 100vh;
                position: fixed;
                left: 0;
                right: 0;
                z-index: -1;
            }
    
            form {
                display: flex;
                flex-direction: column;
                background: #fff;
                width: 400px;
                border-radius: 10px;
                overflow: hidden;
                -webkit-box-shadow: 0px 0px 40px 9px rgba(0,0,0,0.6); 
                box-shadow: 0px 0px 40px 9px rgba(0,0,0,0.4);
                margin: 0 auto; /* Center the form horizontally */
            }
    
            .head {
                background: rgb(0, 132, 255);
                margin-bottom: 10px;
                padding: 15px;
            }
    
            .head h1,
            p {
                text-align: center;
                color: white;
            }
    
            .head p {
                font-size: 12px;
            }
    
            label {
                margin-left: 20px;
            }

            .turnstile-widget-container {
                display: flex;
                justify-content: center; /* Center horizontally */
            }

            input,
            textarea {
                padding: 10px;
                margin: 5px 20px 20px 20px;
                outline: none;
                border-radius: 10px;
                border: 1px solid #ccc;
            }
    
            input:focus,
            textarea:focus {
                border: 1px solid rgb(0, 132, 255);
            }
    
            textarea {
                resize: vertical;
            }
    
            button {
                outline: none;
                background: rgb(0, 132, 255);
                border: none;
                padding: 10px;
                border-radius: 50px;
                margin: 10px;
                color: white;
                cursor: pointer;
                transition: all 0.5s;
            }
    
            button:hover {
                background: rgb(0, 105, 204);
            }
    
            @media screen and (max-width: 417px){
                form {
                    width: 100%;
                    height: 100%;
                }
            }
        </style>
    </head>
    <body>
    <body>
    <div class="bg-image"></div>
    <form method="post">
        <!-- Header -->
        <div class="head">
            <h1>Music Request Form</h1>
            <p>Requester Name and Song Title are Required</p>
        </div>
        <!-- /Header -->

        <!-- Main Form Started -->
        <label for="fullName">Requester Name:</label>
        <input type="text" placeholder="Your Name" name="fullName" id="fullName" required>

        <label for="artist">Artist Name:</label>
        <input type="text" placeholder="Artist" name="artist" id="artist">

        <label for="song">Song Title:</label>
        <input type="text" placeholder="Song" name="song" id="song" required>

        <label for="message">Notes:</label>
        <input type="text" placeholder="Enter any additional info here" name="message" id="message">

        <div class="turnstile-widget-container">
            <!-- Cloudflare Turnstile Script -->
            <div class="cf-turnstile" data-sitekey="1x00000000000000000000AA" data-theme="light"></div>
        </div>

        <!-- Submit Button -->
        <button type="submit" value="Send">Submit</button>
    </form>
    <!-- /Main Form Ended -->
    </body>
    </html>
    `;

    return new Response(htmlContent, {
        headers: { 'content-type': 'text/html' }
    });
}
