import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.net.InetSocketAddress;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import java.text.SimpleDateFormat;
import java.sql.*;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.Headers;


public class HttpSqlServer implements HttpHandler {

	private static final Class<HttpSqlServer> cls = HttpSqlServer.class;
	private static final byte[] SERVER_ERROR = "<html><head><title>500 - Error</title></head><body>500 - Error</body></html>".getBytes();
	private static final byte[] SERVER_RESPONSE = "<html><head><title>500 - Error</title></head><body>500 - NO Message</body></html>".getBytes();
	private static final int port = 8080;

//MS-SQLSERVERの実行環境
	private static String SQLSRV="192.168.0.xxx";
	private static String DBNAME="xxxxxxx";
	private static String USER="xxxxx";
	private static String PASSWD="xxxxx";

	public static void main(String[] args) throws IOException {

		HttpSqlServer HttpSqlServer = new HttpSqlServer();


		HttpServer server = HttpServer.create(new InetSocketAddress(port), 20);

		server.setExecutor(Executors.newFixedThreadPool(5));

		server.createContext("/", HttpSqlServer);
		server.start();

	}

	@Override
	public void handle(HttpExchange ex)  throws IOException {
		Headers head = ex.getResponseHeaders();
		OutputStream out = ex.getResponseBody();
		byte[] buf;
		URL url;
		String strurl;

		try {
			printLog(ex);
			url = cls.getResource(ex.getRequestURI().toString());
			if(ex.getRequestMethod().equals("GET")){
				strurl=ex.getRequestURI().toString();
				ex.sendResponseHeaders(500, SERVER_RESPONSE.length);
				out.write(SERVER_RESPONSE);
			}else{

//パラメータの解析と取得
				InputStreamReader isr=new InputStreamReader(ex.getRequestBody(),"utf-8");
				BufferedReader br = new BufferedReader(isr);
				String wk1 = br.readLine();
				Map<String, String> param=queryToMap(wk1);
				String wk="";
				String[] strurlA = new String[100];
				String drivers=param.get("DB");
				System.out.println("drivers: "+drivers);

				String[] driversA = new String[10];
				driversA=drivers.split(";");
				for(int l=0;l<driversA.length;l++){
					String[] wkdrivers=driversA[l].split("=");
					if(wkdrivers[0].equals("Server")){
						SQLSRV=wkdrivers[1];
					}
					if(wkdrivers[0].equals("database")){
						DBNAME=wkdrivers[1];
					}
				}

				for(String sqlid : param.keySet()) {
					if(sqlid.length()>2){
						strurl=param.get(sqlid);
						if(sqlid.equals("SQL")){
//sqlが１つだったら
							String strurl2=strurl.replaceAll("(?s)/\\*.*\\*/","");
							if(strurl2.trim().toLowerCase().substring(0,7).equals("select ")){
								wk=sqlSelect(SQLSRV,DBNAME,strurl2);
							}else{
								sqlExec(SQLSRV,DBNAME,strurl2);
							}
							break;
						}
					}
				}

				buf = wk.toString().getBytes();
				StringBuilder sb = new StringBuilder(wk);
				head.add("Content-Type","text/html;charset=UTF8");
				head.add("Access-Control-Allow-Origin","*");
				ex.sendResponseHeaders(200, buf.length);
				String wk2=trimSpace(sb.toString());
				buf = wk2.getBytes();
				out.write(buf);
				wk=null;
				wk2=null;
				buf=null;
				sb=null;
			}
		} catch (Exception e) {
			System.err.println("error\n");
			ex.sendResponseHeaders(500, SERVER_ERROR.length);
			out.write(SERVER_ERROR);

			e.printStackTrace();
		} finally {
			out.close();
			ex.close();
		}

	}

//スペースを除去する関数
	public static String trimSpace(String orgStr) {
	    if (orgStr == null) {
	        return null;
	    }
	    
	    char[] val = orgStr.toCharArray();
	    int len = val.length;
	    int st = 0;
	    
	    while ((st < len) && (val[len - 1] <= ' ' || val[len - 1] == ' ')) {
	        len--;
	    }
	    
	    return ((st>0) || (len<val.length)) ? orgStr.substring(st,len):orgStr;
	}

//ＬＯＧを出力する関数
	private void printLog(HttpExchange ex) {
		String sql=ex.getRequestURI().toString();
		sql=sql.replace("+","|");
		try {
			sql=URLDecoder.decode(sql, StandardCharsets.UTF_8.name());
		}catch(Exception e){}
		sql=sql.replace("|","+");
		sql=sql.replace("^","%");
        	Date date = new Date();
        	SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        	System.out.print(sdf1.format(date)+" : ");
		System.out.println(ex.getRemoteAddress());
	}

//ＳＱＬを１行処理する関数
	private String sqlSelect(String srvname,String dbname,String sql) {
		ResultSet rs=null;
		Connection con=null;
		String connectionUrl="";
		Statement stmt=null;
		try {
			Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
		    connectionUrl = "jdbc:sqlserver://"+srvname+";databaseName="+dbname+";user="+USER+";password="+PASSWD;
			con = DriverManager.getConnection(connectionUrl); 

			stmt = con.createStatement();
			rs = stmt.executeQuery(sql);
			ResultSetMetaData metaData = rs.getMetaData();

			String retwk="";
			for (int i = 1; i <= metaData.getColumnCount(); i++) {
				retwk=retwk+"#!#"+metaData.getColumnName(i);
			}
			retwk=retwk.substring(3);

			int columnCount = metaData.getColumnCount();
			while (rs.next()) {
				String rs_get="";
				for(int i=1;i<columnCount+1;i++){
					if(metaData.getColumnType(i)==8){
						rs_get=rs_get +"#!#"+trimSpace(Long.toString(rs.getLong(i)));
					}else{
						rs_get=rs_get +"#!#"+trimSpace(rs.getString(i));
					}
				}
				rs_get=rs_get.substring(3);
				retwk=retwk+"#,#"+rs_get;
				}
			rs.close();
			stmt.close();
			con.close();
			return retwk;
		} catch (Exception e) {
			System.out.println("ERROR["+sql+"]");
			e.printStackTrace();
		}
		finally{
			try{
				if(rs!=null) rs.close();
				if(stmt!=null) stmt.close();
				if(con!=null) con.close();
			}catch(SQLException e){}
		}
		return "";
	}

//パラメータ解析
	public static Map<String, String> queryToMap(String query){
		    Map<String, String> result = new HashMap<String, String>();
		    for (String param : query.split("&")) {
		        String pair[] = param.split("=");
		        if (pair.length>1) {
		        	String sql=pair[1];
		    		sql=sql.replace("+","|");
		    		try {
		    			sql=URLDecoder.decode(sql, StandardCharsets.UTF_8.name());
		    		}catch(Exception e){}
		    		sql=sql.replace("|","+");
					sql=sql.replace("^","%");
		        	result.put(pair[0], sql);
		        }else{
		            result.put(pair[0], "");
		        }
		    }
		    return result;
		  }

//                   
	public static int CheckSql(String sql){
		int ret=0;
		sql=sql.trim()+"  ";
		sql=sql.replace("\t"," ");
		int sqllen=sql.indexOf(" ");
		sql=sql.substring(0,sqllen);
		if (sql.equalsIgnoreCase("select")){ret=1;}
		if (sql.equalsIgnoreCase("execute")){ret=2;}
		if (sql.equalsIgnoreCase("delete")){ret=2;}
		if (sql.equalsIgnoreCase("update")){ret=2;}
		if (sql.equalsIgnoreCase("insert")){ret=2;}
		if (sql.equalsIgnoreCase("begin")){ret=3;}
		if (sql.equalsIgnoreCase("commit")){ret=4;}
		if (sql.equalsIgnoreCase("rollback")){ret=5;}
		return ret;
	}

//sql実行(select以外)
	private Boolean sqlExec(String srvname,String dbname,String sql) {
		ResultSet rs=null;
		Connection con=null;
		Statement stmt=null;
		Boolean ret=true;
		try {

			Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
			String connectionUrl="";
		    connectionUrl = "jdbc:sqlserver://"+srvname+";databaseName="+dbname+";user="+USER+";password="+PASSWD;
			con = DriverManager.getConnection(connectionUrl); 
			stmt = con.createStatement();
			Logout(sql);
			stmt.executeUpdate(sql);
			stmt.close();
		}catch(Exception e){
			System.out.println("Error SQL:"+sql);
			Logout(e.getMessage());
			e.printStackTrace();
			ret=false;
		}finally{
			return ret;
		}

	}

//ログ出力
	private void Logout(String data){
		try{
			File file = new File("./sql_insert.log");
			FileWriter filewriter = new FileWriter(file, true);
		        filewriter.write(data);
		        filewriter.write("\r\n");
			filewriter.close();
		}catch(IOException e){
			System.out.println(e.getMessage());
		}
	}
}
