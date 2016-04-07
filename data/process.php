<?php
$cn = pg_connect ("dbname=airecdmx user=paw");
$q = pg_query ('SELECT * FROM "indice" WHERE extract (year FROM datetime) = \'2016\'') or die (pg_last_error ());
while ($f = pg_fetch_assoc ($q)) { 
	echo "..\n";
	foreach ($f as $k => $v) { 
		if (!empty ($f ['datetime'])) {
			@list ($est, $cont) = explode ("_", $k);
			$x = explode ("_", $k);
			$est = $x [0];
			$cont = trim (implode ("_", array_slice ($x, 1)));
			if (!empty ($cont) && $cont != "fid") { 
				echo "{$f['datetime']} $est $cont = $v\n";
				if (!is_numeric ($v)) $v = -1;
				pg_query ("INSERT INTO aire (fecha,estacion,contaminante,medicion) VALUES ('{$f['datetime']}', '{$est}', '{$cont}', '{$v}')");
			}
		}
	}
}
?>
