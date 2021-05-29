package PutTogetherTiles.src;

import java.net.*;
import java.io.*;
import java.util.*;

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
        DataInputStream reader = new DataInputStream(new InputStreamReader(client.getInputStream()));
        
        String comando = "";
        while( (dt = reader.readByte()) >= 0){
            
            //telaOutput.adicionaFim(msgDoSocket);
            try {
                comando += msgDoSocket + " ";
                //System.out.println(comando);
                if(msgDoSocket.isEmpty()){
                    processaInput(comando);
                }
            } catch (Exception ex) {
                Logger.getLogger(ServerThread.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        System.out.println(comando);
        OutputStream clientOutput = client.getOutputStream();

        clientOutput.write(("HTTP/1.1 \r\n" + "200 OK").getBytes());
        clientOutput.write(("ContentType: " + "application/json" + "\r\n").getBytes());
        clientOutput.write("\r\n".getBytes());

        String s = "{ \"Id\": 1, \"Name\": \"Coke\" }";
        clientOutput.write(s.getBytes());
        clientOutput.write("\r\n\r\n".getBytes());
        clientOutput.flush();
        client.close();



    }
}
