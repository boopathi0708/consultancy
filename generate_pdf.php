<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Include TCPDF library
    require_once('vendor/autoload.php');

    // Function to generate the PDF from HTML content
    function generatePDF($htmlContent) {
        try {
            // Create new PDF document
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            // Set document information
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor('Your Name');
            $pdf->SetTitle('Invoice');
            $pdf->SetSubject('Generating PDF Invoice with PHP');
            $pdf->SetKeywords('PDF, PHP, HTML, TCPDF');

            // Set default font
            $pdf->SetFont('helvetica', '', 12);

            // Add a page
            $pdf->AddPage();

            // Write HTML content to PDF
            $pdf->writeHTML($htmlContent, true, false, true, false, '');

            // Output PDF to browser or save to file
            $pdf->Output('invoice.pdf', 'D'); // 'D' to force download
        } catch (Exception $e) {
            // Log the error
            error_log('Error generating PDF: ' . $e->getMessage());
            // You can handle the error here, for example, you can return an error message to the client
            header('HTTP/1.1 500 Internal Server Error');
            echo 'Error generating PDF. Please try again later.';
        }
    }

    // Retrieve HTML content from POST request
    $htmlContent = isset($_POST['htmlContent']) ? $_POST['htmlContent'] : '';

    // Call the function to generate PDF
    generatePDF($htmlContent);
    exit; // Stop executing the rest of the file
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
</head>
<body>
    <!-- Your invoice content goes here -->
    <h1>Invoice</h1>
    <p>Invoice number: 12345</p>
    <p>Date: May 8, 2024</p>
    <p>Amount: $100</p>
    
    <!-- Button to trigger PDF download -->
    <button id="downloadPdf" onclick="downloadPdf()">Download PDF</button>

    <script>
        function downloadPdf() {
            // Get the invoice content
            var invoiceContent = document.documentElement.innerHTML;
            
            // Make a request to generate and download the PDF
            fetch('', { // Empty URL to send request to the same page
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'htmlContent=' + encodeURIComponent(invoiceContent)
            })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // Set the filename for the downloaded PDF
                a.download = 'invoice.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error('Error downloading PDF:', error));
        }
    </script>
</body>
</html>
