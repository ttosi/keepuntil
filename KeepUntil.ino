#include <EEPROM.h>
#include <Servo.h>
#include <DS3231.h>
#include <SoftwareSerial.h>

#define DEBUG true
#define SET_RTC false
#define SHOW_TIME false

const byte LOCK_SERVO_PIN = 4;
const byte LOCK_OPEN = 110;
const byte LOCK_CLOSED = 20;
const byte OAT_ADDRESS = 0;	//eeprom address to store the open at time

long openAtTime;// = EEPROMReadlong(OAT_ADDRESS);

SoftwareSerial bluetoothSerial(3, 4); //RX, TX
DS3231 rtc(SDA, SCL);
Servo lockServo;

void setup()
{
	if (DEBUG)	Serial.begin(9600);

	bluetoothSerial.begin(9600);
	while (!bluetoothSerial)
	{
		delay(50);
	}

	rtc.begin();

	// day, month, year, 24 hour, minute, second (UTC!)
	//if (SET_RTC) setRtc(17, 3, 2016, 7, 40, 30);

	if (SET_RTC || SHOW_TIME)
	{
		while (1)
		{
			printTimeString();
			delay(1000);
		}
	}

	openAtTime = EEPROMReadlong(OAT_ADDRESS);

	/*Serial.print("OATTIME:");
	Serial.println(openAtTime);*/

	//if (DEBUG) printDebugInfo();
}

void loop()
{
	if (bluetoothSerial.available())
	{
		String request = bluetoothSerial.readString();

		if (DEBUG)
		{
			Serial.print("request > ");
			Serial.println(request);
		}

		if (request == "getrtc")
		{
			bluetoothSerial.println(
				formatJsonString("rtc", (String)rtc.getUnixTime(rtc.getTime()))
				);
		}
		else if (request == "getoat")
		{
			bluetoothSerial.println(
				formatJsonString("oat", (String)EEPROMReadlong(OAT_ADDRESS))
				);
		}
		else if (request.startsWith("setrtc"))
		{
			setRtc(request.substring(request.indexOf(':') + 1));
		}
		else if (request.startsWith("setoat"))
		{
			setOpenAtTime(request.substring(request.indexOf(':') + 1));
		}
	}

	delay(10);

	//if (openAtTime <= getRtcTime())
	//{
	//	if (!isOpen)
	//	{
	//		lockControl("open");
	//	}

	//	//setOpenAtTime();
	//}
	//else
	//{
	//	if (isOpen)
	//	{
	//		lockControl("closed");
	//	}
	//}

	//if (DEBUG) printDebugInfo();

	//delay(1000);
}

void setOpenAtTime(String oat)
{
	char oatBuffer[10];
	oat.toCharArray(oatBuffer, oat.length() + 1);
	
	openAtTime = atol(oatBuffer);

	EEPROMWritelong(OAT_ADDRESS, openAtTime);
}

String readBluetoothRequest()
{
	String request;
	if (bluetoothSerial.available())
	{
		request = bluetoothSerial.readString();
	}

	return request;
}

String formatJsonString(String key, String value)
{
	return "{\"key\":\"" + key + "\",\"value\":\"" + value + "\"}";
}

bool lockPosition() //true - closed, false - open
{

}

void lockControl(String position)
{
	if (position == "closed")
	{
		delay(500);

		lockServo.write(LOCK_CLOSED);
		lockServo.attach(LOCK_SERVO_PIN);

		delay(500);

		byte servoPos = lockServo.read();
		if (servoPos != LOCK_CLOSED)
		{
			lockControl("closed");
		}
	}
	else if (position == "open")
	{
		delay(500);

		lockServo.write(LOCK_OPEN);
		lockServo.attach(LOCK_SERVO_PIN);

		delay(500);

		byte servoPos = lockServo.read();
		if (servoPos != LOCK_OPEN)
		{
			lockControl("open");
		}
	}

	delay(500);
	lockServo.detach();
}

long getRtcTime()
{
	return rtc.getUnixTime(rtc.getTime());
}

void setRtc(String rtcTime)
{
	char rtcBuffer[19];
	char * rtcParts;

	rtcTime.toCharArray(rtcBuffer, rtcTime.length());

	uint8_t day = (uint8_t)atol(strtok(rtcBuffer, "|"));
	uint8_t mon = (uint8_t)atol(strtok(NULL, "|"));
	uint8_t year = (uint8_t)atol(strtok(NULL, "|"));
	uint8_t hour = (uint8_t)atol(strtok(NULL, "|"));
	uint8_t min = (uint8_t)atol(strtok(NULL, "|"));
	uint8_t sec = (uint8_t)atol(strtok(NULL, "|"));

	rtc.setDate(day, mon, year + 2000);

	rtc.setTime(hour, min, sec + 2);

	if (DEBUG) printDebugInfo();
}

void printTimeString()
{
	Serial.print(rtc.getDateStr());
	Serial.print(" ");
	Serial.println(rtc.getTimeStr());
}

String getTimeString()
{
	String time;

	time += rtc.getDateStr();
	time += " ";
	time += rtc.getTimeStr();

	return time;
}

void printDebugInfo()
{
	Serial.println("---------------------");
	Serial.print("rtc time:\t");
	printTimeString();
	Serial.print("rtc unix time:\t");
	Serial.println(getRtcTime());
	Serial.print("oat:\t\t");
	Serial.println(openAtTime);
	Serial.print("second remain:\t");
	Serial.println(openAtTime - getRtcTime());
	Serial.println("---------------------");
}

// ATTRIBUTION:
// Created by Kevin Elsenberger 
// June 2, 2013
// elsenberger.k at gmail.com 
// http://playground.arduino.cc/Code/EEPROMReadWriteLong
long EEPROMReadlong(long address)
{
	long four = EEPROM.read(address);
	long three = EEPROM.read(address + 1);
	long two = EEPROM.read(address + 2);
	long one = EEPROM.read(address + 3);

	return ((four << 0) & 0xFF) + ((three << 8) & 0xFFFF) + ((two << 16) & 0xFFFFFF) + ((one << 24) & 0xFFFFFFFF);
}

// ATTRIBUTION:
// Created by Kevin Elsenberger 
// June 2, 2013
// elsenberger.k at gmail.com 
// http://playground.arduino.cc/Code/EEPROMReadWriteLong
void EEPROMWritelong(int address, long value)
{
	byte four = (value & 0xFF);
	byte three = ((value >> 8) & 0xFF);
	byte two = ((value >> 16) & 0xFF);
	byte one = ((value >> 24) & 0xFF);

	EEPROM.write(address, four);
	EEPROM.write(address + 1, three);
	EEPROM.write(address + 2, two);
	EEPROM.write(address + 3, one);
}
