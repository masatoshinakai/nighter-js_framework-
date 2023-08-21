TEMPLATEのJS内でSQLを実行させる場合は、HttpSqlServerを稼働させる必要がある

HttpSqlServerは何処で稼働させても良い。（中でMS-sqlserverの場所やDB名、user、password指定が必要）

ブラウザ  --> HttpSqlServer  --> MS-sqlserver




windowsでHttpSqlServerを稼働させる場合は

sqljdbc_8.4\jpn\mssql-jdbc-8.4.1.jre8.jar
をCLASSPASSに設定する
