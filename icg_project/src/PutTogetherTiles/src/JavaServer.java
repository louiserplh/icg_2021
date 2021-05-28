package PutTogetherTiles.src;

import java.net.*;
import java.io.*;
import java.util.*;

import org.json.simple.JSONObject;    

// made with help of https://dev.to/mateuszjarzyna/build-your-own-http-server-in-java-in-less-than-one-hour-only-get-method-2k02

public class JavaServer {

    static final int port=3333;

    public static void main(String[] args) {

        try {

            ServerSocket serverSocket = new ServerSocket(port);

            while(true) {
                try(Socket socket = serverSocket.accept()) {
                    handleClient(socket);
                }
                
            }
        
        }
        catch(Exception e) {
            System.out.println("There was an exception");
            e.printStackTrace();  
        }
  
    }

    private static void handleClient(Socket client) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(client.getInputStream()));
        StringBuilder requestBuilder = new StringBuilder();
        String line;
        while (!(line = br.readLine()).isEmpty()) {
            requestBuilder.append(line + "\r\n");
        }

        System.out.println(requestBuilder.toString());
        OutputStream clientOutput = client.getOutputStream();

        clientOutput.write(("HTTP/1.1 \r\n" + "200 OK").getBytes());
        clientOutput.write(("ContentType: " + "application/json" + "\r\n").getBytes());
        clientOutput.write("\r\n".getBytes());

        JSONObject obj = new JSONObject();    
        obj.put("test","a test");  
        clientOutput.write(obj.toString().getBytes());
        clientOutput.write("\r\n\r\n".getBytes());
        clientOutput.flush();
        client.close();



    }
}
